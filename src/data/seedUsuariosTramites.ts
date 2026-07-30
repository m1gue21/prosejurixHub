/// <reference types="vite/client" />
import controlCsv from '../../actualizadoPROCESOS MANIZALES.xlsx - CONTROL PROCESOS ACCIDENTES(1).csv?raw';
import activosCsv from '../../actualizadoPROCESOS MANIZALES.xlsx - ACTIVOS(1).csv?raw';
import tareasCsv from '../../TAREAS_PENDIENTES.csv?raw';
import { mergeManizalesCsvs } from '../lib/csvManizales';
import {
  inferAsignadoFromText,
  normalizePersonName,
  shortTituloFromDetalle
} from '../lib/tareaHelpers';
import { Comunicacion, Usuario } from '../types/tramite';
import { AgendaNota } from '../types/agenda';
import { Tarea } from '../types/tarea';

export interface SeedData {
  usuarios: Usuario[];
  tramites: ReturnType<typeof mergeManizalesCsvs>['tramites'];
  comunicaciones: Comunicacion[];
  notasAgenda: AgendaNota[];
  tareas: Tarea[];
}

const parseSimpleCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const pushCell = () => {
    row.push(cell);
    cell = '';
  };
  const pushRow = () => {
    if (row.some((c) => c.trim())) rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      pushCell();
      continue;
    }
    if (ch === '\n') {
      pushCell();
      pushRow();
      continue;
    }
    if (ch === '\r') continue;
    cell += ch;
  }
  pushCell();
  if (row.length) pushRow();
  return rows;
};

const buildTareasFromCsv = (usuarios: Usuario[], tramites: SeedData['tramites']): Tarea[] => {
  const byName = new Map<string, number>();
  for (const u of usuarios) {
    const key = normalizePersonName(u.nombre);
    if (!byName.has(key)) byName.set(key, u.id);
  }
  const principalByUser = new Map<number, string>();
  for (const t of tramites) {
    if (!t.esCasoAdicional && !principalByUser.has(t.usuarioId)) {
      principalByUser.set(t.usuarioId, t.id);
    }
  }

  const rows = parseSimpleCsv(tareasCsv).slice(1);
  const ahora = new Date().toISOString();
  const tareas: Tarea[] = [];
  let n = 1;

  for (const cols of rows) {
    const nombre = (cols[0] || '').trim();
    const responsabilidad = (cols[1] || '').trim();
    const aseguradora = (cols[3] || '').trim();
    const alcance = (cols[4] || '').trim();
    if (!nombre || !alcance) continue;
    const usuarioId = byName.get(normalizePersonName(nombre));
    const asignadoA = inferAsignadoFromText(alcance);
    tareas.push({
      id: `task-excel-${n++}`,
      titulo: shortTituloFromDetalle(alcance),
      detalle: [alcance, responsabilidad && `Resp: ${responsabilidad}`, aseguradora && `Aseg: ${aseguradora}`]
        .filter(Boolean)
        .join(' · '),
      estado: 'pendiente',
      asignadoA,
      usuarioId,
      tramiteId: usuarioId != null ? principalByUser.get(usuarioId) : undefined,
      origen: 'excel',
      origenKey: `excel|${normalizePersonName(nombre)}|${normalizePersonName(alcance).slice(0, 80)}`,
      creadoPor: 'import-excel',
      creadoEn: ahora
    });
  }
  return tareas;
};

export const buildSeedFromMocks = (): SeedData => {
  const { usuarios, tramites, stats } = mergeManizalesCsvs(controlCsv, activosCsv);
  if (typeof console !== 'undefined') {
    console.info('[seed Manizales]', stats);
  }

  const today = new Date();
  const toIsoDay = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const offsetDay = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return toIsoDay(d);
  };

  const comunicaciones: Comunicacion[] = [];
  const notasAgenda: AgendaNota[] = [];
  const sample = usuarios.slice(0, 12);

  sample.forEach((u, i) => {
    const tramite = tramites.find((t) => t.usuarioId === u.id && !t.esCasoAdicional);
    comunicaciones.push({
      id: `c-seed-${u.id}-1`,
      usuarioId: u.id,
      tramiteId: tramite?.id,
      tipo: 'llamada',
      direccion: 'hacia_cliente',
      fecha: `${offsetDay(-2)}T15:00:00.000Z`,
      asunto: 'Seguimiento del caso',
      contenido: 'Llamada de seguimiento sobre documentos y próximos pasos.',
      registradoPor: 'Asesoría',
      duracionMinutos: 10
    });
    if (i % 2 === 0) {
      comunicaciones.push({
        id: `c-seed-${u.id}-2`,
        usuarioId: u.id,
        tramiteId: tramite?.id,
        tipo: 'mensaje',
        direccion: 'desde_cliente',
        fecha: `${offsetDay(-1)}T11:30:00.000Z`,
        asunto: 'Consulta WhatsApp',
        contenido: 'Cliente preguntó por el estado de la reclamación.',
        registradoPor: 'Mesa de entrada'
      });
    }

    notasAgenda.push({
      id: `n-seed-${u.id}-1`,
      tipo: i % 2 === 0 ? 'recordatorio' : 'novedad',
      fecha: offsetDay(i % 5 === 0 ? 0 : i % 3),
      titulo:
        i % 2 === 0
          ? `Llamar a ${u.nombre.split(' ')[0]}`
          : `Novedad caso ${u.nombre.split(' ')[0]}`,
      detalle: tramite?.gestion || tramite?.alcance || 'Revisar avance del trámite',
      usuarioId: u.id,
      tramiteId: tramite?.id,
      hecho: false,
      creadoPor: 'Equipo',
      creadoEn: new Date().toISOString()
    });
  });

  const tareas = buildTareasFromCsv(usuarios, tramites);
  if (typeof console !== 'undefined') {
    console.info('[seed Tareas]', { total: tareas.length });
  }

  return { usuarios, tramites, comunicaciones, notasAgenda, tareas };
};
