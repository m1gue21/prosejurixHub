import { getTipoComunicacionLabel } from '../data/comunicacionesCatalog';
import { getEtapaLabel } from '../data/tramitesCatalog';
import { AgendaItem, AgendaNota, PrioridadAgenda } from '../types/agenda';
import { Comunicacion, Tramite, Usuario } from '../types/tramite';
import { getCaducidadInfo, toIsoDate } from './caducidad';

export type AgendaFilterMode = 'day' | 'week' | 'month' | 'urgentes';

export interface AgendaFilter {
  mode: AgendaFilterMode;
  /** Día ancla YYYY-MM-DD */
  day: string;
}

export interface AgendaSource {
  usuarios: Usuario[];
  tramites: Tramite[];
  comunicaciones: Comunicacion[];
  notasAgenda: AgendaNota[];
}

const pad = (n: number) => String(n).padStart(2, '0');

export const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const addDaysIso = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

/** Lunes de la semana del día dado */
export const startOfWeekIso = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 dom ... 6 sab
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toIsoDate(date);
};

export const weekDaysIso = (anchorIso: string): string[] => {
  const start = startOfWeekIso(anchorIso);
  return Array.from({ length: 7 }, (_, i) => addDaysIso(start, i));
};

export const startOfMonthIso = (iso: string): string => {
  const [y, m] = iso.split('-').map(Number);
  return `${y}-${pad(m)}-01`;
};

export const endOfMonthIso = (iso: string): string => {
  const [y, m] = iso.split('-').map(Number);
  const last = new Date(y, m, 0);
  return toIsoDate(last);
};

export const endOfWeekIso = (iso: string): string => addDaysIso(startOfWeekIso(iso), 6);

const prioridadRank = (p: PrioridadAgenda): number => {
  switch (p) {
    case 'critica':
      return 0;
    case 'alta':
      return 1;
    case 'media':
      return 2;
    default:
      return 3;
  }
};

const sortItems = (items: AgendaItem[]): AgendaItem[] =>
  [...items].sort((a, b) => {
    const pr = prioridadRank(a.prioridad) - prioridadRank(b.prioridad);
    if (pr !== 0) return pr;
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    return a.titulo.localeCompare(b.titulo);
  });

const inRange = (fecha: string, from: string, to: string) =>
  fecha >= from && fecha <= to;

const matchesFilter = (fecha: string, filter: AgendaFilter): boolean => {
  if (filter.mode === 'day') return fecha === filter.day;
  if (filter.mode === 'week') {
    return inRange(fecha, startOfWeekIso(filter.day), endOfWeekIso(filter.day));
  }
  if (filter.mode === 'month') {
    return inRange(fecha, startOfMonthIso(filter.day), endOfMonthIso(filter.day));
  }
  return false;
};

export const buildAllAgendaItems = (source: AgendaSource): AgendaItem[] => {
  const userById = new Map(source.usuarios.map((u) => [u.id, u]));
  const items: AgendaItem[] = [];

  for (const nota of source.notasAgenda) {
    const user = nota.usuarioId != null ? userById.get(nota.usuarioId) : undefined;
    const tramite = nota.tramiteId
      ? source.tramites.find((t) => t.id === nota.tramiteId)
      : undefined;
    items.push({
      id: `nota-${nota.id}`,
      tipo: nota.tipo,
      fecha: nota.fecha,
      titulo: nota.titulo,
      detalle: nota.detalle,
      usuarioId: nota.usuarioId,
      usuarioNombre: user?.nombre,
      tramiteId: nota.tramiteId,
      tramiteTitulo: tramite?.titulo,
      hecho: nota.hecho,
      prioridad: nota.hecho ? 'baja' : nota.tipo === 'recordatorio' ? 'alta' : 'media',
      editable: true,
      notaId: nota.id
    });
  }

  for (const tramite of source.tramites) {
    if (tramite.estadoGeneral === 'finalizado') continue;
    const user = userById.get(tramite.usuarioId);
    const cad = getCaducidadInfo(tramite);
    if (cad.caducidad) {
      let prioridad: PrioridadAgenda = 'media';
      if (cad.urgencia === 'vencida' || cad.urgencia === 'critica') prioridad = 'critica';
      else if (cad.urgencia === 'alerta') prioridad = 'alta';
      else if (cad.urgencia === 'ok') prioridad = 'baja';

      items.push({
        id: `cad-${tramite.id}`,
        tipo: 'caducidad',
        fecha: cad.caducidad,
        titulo: `Caducidad — ${user?.nombre || `Usuario ${tramite.usuarioId}`}`,
        detalle: `${cad.reglaLabel}${cad.labelUrgencia ? ` · ${cad.labelUrgencia}` : ''}`,
        usuarioId: tramite.usuarioId,
        usuarioNombre: user?.nombre,
        tramiteId: tramite.id,
        tramiteTitulo: tramite.titulo,
        prioridad,
        editable: false
      });
    }

    for (const etapa of tramite.etapas) {
      if (etapa.estado === 'no_aplica') continue;
      if (etapa.fechaInicio) {
        items.push({
          id: `etapa-ini-${tramite.id}-${etapa.tipo}`,
          tipo: 'etapa',
          fecha: etapa.fechaInicio.slice(0, 10),
          titulo: `Inicio etapa: ${getEtapaLabel(etapa.tipo)}`,
          detalle: tramite.titulo,
          usuarioId: tramite.usuarioId,
          usuarioNombre: user?.nombre,
          tramiteId: tramite.id,
          tramiteTitulo: tramite.titulo,
          prioridad: 'media',
          editable: false
        });
      }
      if (etapa.fechaFin) {
        items.push({
          id: `etapa-fin-${tramite.id}-${etapa.tipo}`,
          tipo: 'etapa',
          fecha: etapa.fechaFin.slice(0, 10),
          titulo: `Fin etapa: ${getEtapaLabel(etapa.tipo)}`,
          detalle: tramite.titulo,
          usuarioId: tramite.usuarioId,
          usuarioNombre: user?.nombre,
          tramiteId: tramite.id,
          tramiteTitulo: tramite.titulo,
          prioridad: 'media',
          editable: false
        });
      }
    }
  }

  for (const c of source.comunicaciones) {
    const user = userById.get(c.usuarioId);
    const fecha = c.fecha.slice(0, 10);
    items.push({
      id: `comm-${c.id}`,
      tipo: 'comunicacion',
      fecha,
      titulo: c.asunto || getTipoComunicacionLabel(c.tipo, true),
      detalle: c.contenido,
      usuarioId: c.usuarioId,
      usuarioNombre: user?.nombre,
      tramiteId: c.tramiteId,
      prioridad: 'baja',
      editable: false
    });
  }

  return sortItems(items);
};

export const filterAgendaItems = (
  items: AgendaItem[],
  filter: AgendaFilter
): AgendaItem[] => {
  if (filter.mode === 'urgentes') {
    return sortItems(
      items.filter(
        (i) =>
          i.tipo === 'caducidad' &&
          (i.prioridad === 'critica' || i.prioridad === 'alta') &&
          !i.hecho
      )
    );
  }
  return sortItems(items.filter((i) => matchesFilter(i.fecha, filter)));
};

export const countByDay = (
  items: AgendaItem[],
  days: string[]
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const day of days) counts[day] = 0;
  for (const item of items) {
    if (counts[item.fecha] != null) counts[item.fecha] += 1;
  }
  return counts;
};

export const countToday = (items: AgendaItem[]): number => {
  const today = todayIso();
  return items.filter((i) => i.fecha === today && !i.hecho).length;
};
