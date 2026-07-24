import { buildSeedFromMocks } from '../data/seedUsuariosTramites';
import { createInitialEtapas, getEtapaLabel } from '../data/tramitesCatalog';
import { computeCaducidadFromAccidente } from './caducidad';
import { AgendaNota } from '../types/agenda';
import {
  ChecklistItem,
  Comunicacion,
  DocumentoArchivo,
  EtapaTramite,
  TipoEtapa,
  Tramite,
  Usuario,
  UsuarioConTramites
} from '../types/tramite';
import { upsertChecklistArchivo } from './documentHelpers';

const STORAGE_KEY = 'prosejurix_mock_usuarios_tramites';
const SEED_VERSION = '2026-07-22-tramites-v8-manizales-csv';
const VERSION_KEY = 'prosejurix_mock_usuarios_seed_version';

interface StoreShape {
  usuarios: Usuario[];
  tramites: Tramite[];
  comunicaciones: Comunicacion[];
  notasAgenda: AgendaNota[];
}

const normalizeStore = (parsed: Partial<StoreShape>): StoreShape | null => {
  if (!parsed?.usuarios?.length || !parsed?.tramites) return null;
  return {
    usuarios: parsed.usuarios,
    tramites: parsed.tramites,
    comunicaciones: Array.isArray(parsed.comunicaciones) ? parsed.comunicaciones : [],
    notasAgenda: Array.isArray(parsed.notasAgenda) ? parsed.notasAgenda : []
  };
};

const readStore = (): StoreShape => {
  if (typeof window === 'undefined') {
    return buildSeedFromMocks();
  }

  try {
    const savedVersion = window.localStorage.getItem(VERSION_KEY);
    if (savedVersion !== SEED_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem(VERSION_KEY, SEED_VERSION);
      const seed = buildSeedFromMocks();
      writeStore(seed);
      return seed;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const normalized = normalizeStore(JSON.parse(saved) as Partial<StoreShape>);
      if (normalized) {
        let repaired = normalized;
        if (normalized.comunicaciones.length === 0 || normalized.notasAgenda.length === 0) {
          const seed = buildSeedFromMocks();
          const userIds = new Set(normalized.usuarios.map((u) => u.id));
          repaired = {
            ...normalized,
            comunicaciones:
              normalized.comunicaciones.length > 0
                ? normalized.comunicaciones
                : seed.comunicaciones.filter((c) => userIds.has(c.usuarioId)),
            notasAgenda:
              normalized.notasAgenda.length > 0
                ? normalized.notasAgenda
                : seed.notasAgenda.filter((n) => !n.usuarioId || userIds.has(n.usuarioId))
          };
          writeStore(repaired);
        }
        return repaired;
      }
    }
  } catch {
    // ignore corrupt storage
  }

  const seed = buildSeedFromMocks();
  writeStore(seed);
  return seed;
};

const writeStore = (data: StoreShape): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const nextUsuarioId = (usuarios: Usuario[]): number =>
  usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;

const nextTramiteId = (tramites: Tramite[]): string => {
  const max = tramites.reduce((acc, t) => {
    const n = Number(String(t.id).replace(/\D/g, ''));
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `t-${max + 1}`;
};

const nextComunicacionId = (comunicaciones: Comunicacion[]): string => {
  const max = comunicaciones.reduce((acc, c) => {
    const n = Number(String(c.id).replace(/\D/g, ''));
    return Number.isNaN(n) ? acc : Math.max(acc, n);
  }, 0);
  return `c-${max + 1}`;
};

const nextNotaId = (notas: AgendaNota[]): string => {
  const max = notas.reduce((acc, n) => {
    const num = Number(String(n.id).replace(/\D/g, ''));
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `n-${max + 1}`;
};

const attachTramites = (usuario: Usuario, tramites: Tramite[]): UsuarioConTramites => ({
  ...usuario,
  tramites: tramites
    .filter((t) => t.usuarioId === usuario.id)
    .sort((a, b) => Number(a.esCasoAdicional) - Number(b.esCasoAdicional))
});

const sortCommsDesc = (items: Comunicacion[]) =>
  [...items].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

const withCaducidad = <T extends Partial<Tramite>>(tramite: T): T => {
  const fechaAccidente =
    'fechaAccidente' in tramite ? tramite.fechaAccidente : undefined;
  const responsabilidad =
    'responsabilidad' in tramite ? tramite.responsabilidad : undefined;
  const computed = computeCaducidadFromAccidente(fechaAccidente, responsabilidad);
  return {
    ...tramite,
    caducidad: computed || tramite.caducidad
  };
};

export const mockUserStore = {
  getAll(): UsuarioConTramites[] {
    const { usuarios, tramites } = readStore();
    return [...usuarios]
      .sort((a, b) => a.id - b.id)
      .map((u) => attachTramites(u, tramites));
  },

  getUsuario(id: number): UsuarioConTramites | undefined {
    const { usuarios, tramites } = readStore();
    const usuario = usuarios.find((u) => u.id === id);
    return usuario ? attachTramites(usuario, tramites) : undefined;
  },

  getTramite(id: string): Tramite | undefined {
    return readStore().tramites.find((t) => t.id === id);
  },

  getTramitePrincipal(usuarioId: number): Tramite | undefined {
    const tramites = readStore().tramites.filter((t) => t.usuarioId === usuarioId);
    return tramites.find((t) => !t.esCasoAdicional) || tramites[0];
  },

  getComunicaciones(usuarioId: number, tramiteId?: string): Comunicacion[] {
    const { comunicaciones } = readStore();
    return sortCommsDesc(
      comunicaciones.filter((c) => {
        if (c.usuarioId !== usuarioId) return false;
        if (tramiteId && c.tramiteId && c.tramiteId !== tramiteId) return false;
        return true;
      })
    );
  },

  createComunicacion(
    data: Omit<Comunicacion, 'id'> & { id?: string }
  ): Comunicacion {
    const store = readStore();
    const created: Comunicacion = {
      id: data.id || nextComunicacionId(store.comunicaciones),
      usuarioId: data.usuarioId,
      tramiteId: data.tramiteId,
      tipo: data.tipo,
      direccion: data.direccion,
      fecha: data.fecha || new Date().toISOString(),
      asunto: data.asunto,
      contenido: data.contenido,
      registradoPor: data.registradoPor,
      duracionMinutos: data.duracionMinutos
    };
    writeStore({
      ...store,
      comunicaciones: [...store.comunicaciones, created]
    });
    return created;
  },

  updateComunicacion(id: string, updates: Partial<Comunicacion>): Comunicacion {
    const store = readStore();
    const index = store.comunicaciones.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Comunicación ${id} no encontrada`);
    const updated = { ...store.comunicaciones[index], ...updates, id };
    const comunicaciones = [...store.comunicaciones];
    comunicaciones[index] = updated;
    writeStore({ ...store, comunicaciones });
    return updated;
  },

  deleteComunicacion(id: string): void {
    const store = readStore();
    writeStore({
      ...store,
      comunicaciones: store.comunicaciones.filter((c) => c.id !== id)
    });
  },

  getSnapshot(): StoreShape {
    return readStore();
  },

  getNotasAgenda(): AgendaNota[] {
    return [...readStore().notasAgenda].sort((a, b) => a.fecha.localeCompare(b.fecha));
  },

  createNotaAgenda(
    data: Omit<AgendaNota, 'id' | 'creadoEn' | 'hecho'> & { id?: string; hecho?: boolean; creadoEn?: string }
  ): AgendaNota {
    const store = readStore();
    const created: AgendaNota = {
      id: data.id || nextNotaId(store.notasAgenda),
      tipo: data.tipo,
      fecha: data.fecha,
      titulo: data.titulo,
      detalle: data.detalle,
      usuarioId: data.usuarioId,
      tramiteId: data.tramiteId,
      hecho: data.hecho ?? false,
      creadoPor: data.creadoPor,
      creadoEn: data.creadoEn || new Date().toISOString()
    };
    writeStore({
      ...store,
      notasAgenda: [...store.notasAgenda, created]
    });
    return created;
  },

  updateNotaAgenda(id: string, updates: Partial<AgendaNota>): AgendaNota {
    const store = readStore();
    const index = store.notasAgenda.findIndex((n) => n.id === id);
    if (index === -1) throw new Error(`Nota ${id} no encontrada`);
    const updated = { ...store.notasAgenda[index], ...updates, id };
    const notasAgenda = [...store.notasAgenda];
    notasAgenda[index] = updated;
    writeStore({ ...store, notasAgenda });
    return updated;
  },

  deleteNotaAgenda(id: string): void {
    const store = readStore();
    writeStore({
      ...store,
      notasAgenda: store.notasAgenda.filter((n) => n.id !== id)
    });
  },

  createUsuario(
    data: Omit<Usuario, 'id'> & {
      tituloTramite?: string;
      fechaAccidente?: string;
      fechaEstructuracion?: string;
      lugarAccidente?: string;
      aseguradora?: string;
      responsabilidad?: string;
    }
  ): UsuarioConTramites {
    const store = readStore();
    const id = nextUsuarioId(store.usuarios);
    const usuario: Usuario = {
      id,
      nombre: data.nombre,
      cedula: data.cedula,
      telefono: data.telefono,
      celular: data.celular,
      celularSecundario: data.celularSecundario,
      email: data.email,
      direccion: data.direccion,
      ciudad: data.ciudad,
      fechaVinculacion: data.fechaVinculacion || new Date().toISOString().split('T')[0],
      poderesFirmados: data.poderesFirmados ?? true,
      casoEntregado: data.casoEntregado ?? true,
      tieneVehiculoInvolucrado: data.tieneVehiculoInvolucrado ?? false
    };

    const tramite = withCaducidad({
      id: nextTramiteId(store.tramites),
      usuarioId: id,
      titulo: data.tituloTramite || 'Nuevo trámite',
      casoLabel: data.aseguradora || data.fechaAccidente,
      estadoGeneral: 'activo' as const,
      etapaActual: 'accion_penal' as const,
      esCasoAdicional: false,
      fechaAccidente: data.fechaAccidente,
      fechaEstructuracion: data.fechaEstructuracion,
      lugarAccidente: data.lugarAccidente,
      aseguradora: data.aseguradora,
      responsabilidad: data.responsabilidad || 'Extracontractual',
      fechaIngreso: usuario.fechaVinculacion,
      etapas: createInitialEtapas(usuario.tieneVehiculoInvolucrado),
      observacionesCliente: 'Tu caso ha sido vinculado. Pronto tendrás novedades.'
    });

    writeStore({
      usuarios: [...store.usuarios, usuario],
      tramites: [...store.tramites, tramite],
      comunicaciones: store.comunicaciones,
      notasAgenda: store.notasAgenda
    });

    return attachTramites(usuario, [tramite]);
  },

  updateUsuario(id: number, updates: Partial<Usuario>): UsuarioConTramites {
    const store = readStore();
    const index = store.usuarios.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`Usuario ${id} no encontrado`);

    const updated = { ...store.usuarios[index], ...updates, id };
    const usuarios = [...store.usuarios];
    usuarios[index] = updated;

    let tramites = store.tramites;
    if (typeof updates.tieneVehiculoInvolucrado === 'boolean') {
      tramites = tramites.map((t) => {
        if (t.usuarioId !== id || t.esCasoAdicional) return t;
        return {
          ...t,
          etapas: t.etapas.map((e) => {
            if (e.tipo !== 'liberacion_vehiculos') return e;
            if (updates.tieneVehiculoInvolucrado) {
              return e.estado === 'no_aplica' ? { ...e, estado: 'pendiente' as const } : e;
            }
            return { ...e, estado: 'no_aplica' as const };
          })
        };
      });
    }

    writeStore({ ...store, usuarios, tramites });
    return attachTramites(updated, tramites);
  },

  createCasoAdicional(
    usuarioId: number,
    data: Partial<
      Pick<
        Tramite,
        | 'titulo'
        | 'fechaAccidente'
        | 'fechaEstructuracion'
        | 'aseguradora'
        | 'lugarAccidente'
        | 'responsabilidad'
      >
    >
  ): Tramite {
    const store = readStore();
    const usuario = store.usuarios.find((u) => u.id === usuarioId);
    if (!usuario) throw new Error(`Usuario ${usuarioId} no encontrado`);

    const tramite = withCaducidad({
      id: nextTramiteId(store.tramites),
      usuarioId,
      titulo: data.titulo || 'Caso adicional',
      casoLabel: data.aseguradora || data.fechaAccidente,
      estadoGeneral: 'activo' as const,
      etapaActual: 'accion_penal' as const,
      esCasoAdicional: true,
      fechaAccidente: data.fechaAccidente,
      fechaEstructuracion: data.fechaEstructuracion,
      lugarAccidente: data.lugarAccidente,
      aseguradora: data.aseguradora,
      responsabilidad: data.responsabilidad || 'Extracontractual',
      fechaIngreso: new Date().toISOString().split('T')[0],
      etapas: createInitialEtapas(usuario.tieneVehiculoInvolucrado),
      observacionesCliente: 'Se ha abierto un caso adicional en tu cuenta.'
    });

    writeStore({
      ...store,
      tramites: [...store.tramites, tramite]
    });
    return tramite;
  },

  updateTramite(id: string, updates: Partial<Tramite>): Tramite {
    const store = readStore();
    const index = store.tramites.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Trámite ${id} no encontrado`);

    const merged = { ...store.tramites[index], ...updates, id };
    const updated = withCaducidad(merged);
    const tramites = [...store.tramites];
    tramites[index] = updated;
    writeStore({ ...store, tramites });
    return updated;
  },

  updateEtapa(
    tramiteId: string,
    etapaTipo: TipoEtapa,
    updates: Partial<EtapaTramite> & { checklist?: ChecklistItem[] }
  ): Tramite {
    const store = readStore();
    const index = store.tramites.findIndex((t) => t.id === tramiteId);
    if (index === -1) throw new Error(`Trámite ${tramiteId} no encontrado`);

    const tramite = store.tramites[index];
    const etapas = tramite.etapas.map((e) =>
      e.tipo === etapaTipo ? { ...e, ...updates, tipo: e.tipo, id: e.id } : e
    );

    let etapaActual = tramite.etapaActual;
    const etapa = etapas.find((e) => e.tipo === etapaTipo);
    if (etapa?.estado === 'en_curso') {
      etapaActual = etapaTipo;
    }

    const updated: Tramite = { ...tramite, etapas, etapaActual };
    const tramites = [...store.tramites];
    tramites[index] = updated;
    writeStore({ ...store, tramites });
    return updated;
  },

  setEtapaActual(tramiteId: string, etapaTipo: TipoEtapa): Tramite {
    const store = readStore();
    const index = store.tramites.findIndex((t) => t.id === tramiteId);
    if (index === -1) throw new Error(`Trámite ${tramiteId} no encontrado`);

    const today = new Date().toISOString().split('T')[0];
    const tramite = store.tramites[index];
    const etapas = tramite.etapas.map((e) => {
      if (e.tipo === etapaTipo) {
        if (e.estado === 'no_aplica') return e;
        return {
          ...e,
          estado: 'en_curso' as const,
          fechaInicio: e.fechaInicio || today
        };
      }
      return e;
    });

    const updated: Tramite = { ...tramite, etapas, etapaActual: etapaTipo };
    const tramites = [...store.tramites];
    tramites[index] = updated;
    writeStore({ ...store, tramites });
    return updated;
  },

  upsertDocumento(
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string,
    archivo: DocumentoArchivo
  ): Tramite {
    const store = readStore();
    const index = store.tramites.findIndex((t) => t.id === tramiteId);
    if (index === -1) throw new Error(`Trámite ${tramiteId} no encontrado`);
    const tramite = store.tramites[index];
    const etapas = tramite.etapas.map((e) => {
      if (e.tipo !== etapaTipo) return e;
      return {
        ...e,
        checklist: upsertChecklistArchivo(e.checklist, checklistItemId, archivo)
      };
    });
    const updated = { ...tramite, etapas };
    const tramites = [...store.tramites];
    tramites[index] = updated;
    writeStore({ ...store, tramites });
    return updated;
  },

  removeDocumento(tramiteId: string, etapaTipo: TipoEtapa, checklistItemId: string): Tramite {
    const store = readStore();
    const index = store.tramites.findIndex((t) => t.id === tramiteId);
    if (index === -1) throw new Error(`Trámite ${tramiteId} no encontrado`);
    const tramite = store.tramites[index];
    const etapas = tramite.etapas.map((e) => {
      if (e.tipo !== etapaTipo) return e;
      return {
        ...e,
        checklist: upsertChecklistArchivo(e.checklist, checklistItemId, undefined)
      };
    });
    const updated = { ...tramite, etapas };
    const tramites = [...store.tramites];
    tramites[index] = updated;
    writeStore({ ...store, tramites });
    return updated;
  },

  deleteUsuario(id: number): void {
    const store = readStore();
    writeStore({
      usuarios: store.usuarios.filter((u) => u.id !== id),
      tramites: store.tramites.filter((t) => t.usuarioId !== id),
      comunicaciones: store.comunicaciones.filter((c) => c.usuarioId !== id),
      notasAgenda: store.notasAgenda.filter((n) => n.usuarioId !== id)
    });
  },

  getStats() {
    const users = this.getAll();
    const tramites = users.flatMap((u) => u.tramites);
    const activos = tramites.filter((t) => t.estadoGeneral === 'activo').length;
    const finalizados = tramites.filter((t) => t.estadoGeneral === 'finalizado').length;
    const enReclamacion = tramites.filter((t) => t.etapaActual === 'reclamacion_aseguradora').length;
    const enConciliacion = tramites.filter((t) => t.etapaActual === 'conciliacion_prejudicial').length;
    const enJudicial = tramites.filter((t) => t.etapaActual === 'proceso_judicial').length;

    return {
      totalUsuarios: users.length,
      totalTramites: tramites.length,
      activos,
      finalizados,
      enReclamacion,
      enConciliacion,
      enJudicial
    };
  },

  getEtapaPublicaLabel(tramite: Tramite): string {
    return getEtapaLabel(tramite.etapaActual, true);
  },

  reset(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.setItem(VERSION_KEY, SEED_VERSION);
  }
};
