import { buildSeedFromMocks } from '../data/seedUsuariosTramites';
import { createInitialEtapas, getEtapaLabel } from '../data/tramitesCatalog';
import {
  ChecklistItem,
  DocumentoArchivo,
  EtapaTramite,
  TipoEtapa,
  Tramite,
  Usuario,
  UsuarioConTramites
} from '../types/tramite';
import { upsertChecklistArchivo } from './documentHelpers';

const STORAGE_KEY = 'prosejurix_mock_usuarios_tramites';
const SEED_VERSION = '2026-07-22-tramites-v3-docs';
const VERSION_KEY = 'prosejurix_mock_usuarios_seed_version';

interface StoreShape {
  usuarios: Usuario[];
  tramites: Tramite[];
}

const readStore = (): StoreShape => {
  if (typeof window === 'undefined') {
    return buildSeedFromMocks();
  }

  try {
    const savedVersion = window.localStorage.getItem(VERSION_KEY);
    if (savedVersion !== SEED_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as StoreShape;
      if (parsed?.usuarios?.length && parsed?.tramites) {
        return parsed;
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

const attachTramites = (usuario: Usuario, tramites: Tramite[]): UsuarioConTramites => ({
  ...usuario,
  tramites: tramites
    .filter((t) => t.usuarioId === usuario.id)
    .sort((a, b) => Number(a.esCasoAdicional) - Number(b.esCasoAdicional))
});

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

  createUsuario(
    data: Omit<Usuario, 'id'> & {
      tituloTramite?: string;
      fechaAccidente?: string;
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

    const tramite: Tramite = {
      id: nextTramiteId(store.tramites),
      usuarioId: id,
      titulo: data.tituloTramite || 'Nuevo trámite',
      casoLabel: data.aseguradora || data.fechaAccidente,
      estadoGeneral: 'activo',
      etapaActual: 'accion_penal',
      esCasoAdicional: false,
      fechaAccidente: data.fechaAccidente,
      lugarAccidente: data.lugarAccidente,
      aseguradora: data.aseguradora,
      responsabilidad: data.responsabilidad,
      fechaIngreso: usuario.fechaVinculacion,
      etapas: createInitialEtapas(usuario.tieneVehiculoInvolucrado),
      observacionesCliente: 'Tu caso ha sido vinculado. Pronto tendrás novedades.'
    };

    writeStore({
      usuarios: [...store.usuarios, usuario],
      tramites: [...store.tramites, tramite]
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

    // Si cambia el flag de vehículo, ajustar etapa liberación
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

    writeStore({ usuarios, tramites });
    return attachTramites(updated, tramites);
  },

  createCasoAdicional(
    usuarioId: number,
    data: Partial<Pick<Tramite, 'titulo' | 'fechaAccidente' | 'aseguradora' | 'lugarAccidente' | 'responsabilidad'>>
  ): Tramite {
    const store = readStore();
    const usuario = store.usuarios.find((u) => u.id === usuarioId);
    if (!usuario) throw new Error(`Usuario ${usuarioId} no encontrado`);

    const tramite: Tramite = {
      id: nextTramiteId(store.tramites),
      usuarioId,
      titulo: data.titulo || 'Caso adicional',
      casoLabel: data.aseguradora || data.fechaAccidente,
      estadoGeneral: 'activo',
      etapaActual: 'accion_penal',
      esCasoAdicional: true,
      fechaAccidente: data.fechaAccidente,
      lugarAccidente: data.lugarAccidente,
      aseguradora: data.aseguradora,
      responsabilidad: data.responsabilidad,
      fechaIngreso: new Date().toISOString().split('T')[0],
      etapas: createInitialEtapas(usuario.tieneVehiculoInvolucrado),
      observacionesCliente: 'Se ha abierto un caso adicional en tu cuenta.'
    };

    writeStore({
      usuarios: store.usuarios,
      tramites: [...store.tramites, tramite]
    });
    return tramite;
  },

  updateTramite(id: string, updates: Partial<Tramite>): Tramite {
    const store = readStore();
    const index = store.tramites.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Trámite ${id} no encontrado`);

    const updated = { ...store.tramites[index], ...updates, id };
    const tramites = [...store.tramites];
    tramites[index] = updated;
    writeStore({ usuarios: store.usuarios, tramites });
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
    writeStore({ usuarios: store.usuarios, tramites });
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
    writeStore({ usuarios: store.usuarios, tramites });
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
    writeStore({ usuarios: store.usuarios, tramites });
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
    writeStore({ usuarios: store.usuarios, tramites });
    return updated;
  },

  deleteUsuario(id: number): void {
    const store = readStore();
    writeStore({
      usuarios: store.usuarios.filter((u) => u.id !== id),
      tramites: store.tramites.filter((t) => t.usuarioId !== id)
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
