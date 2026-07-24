import { mockUserStore } from './mockUserStore';
import { usuariosRepo } from './repositories/usuariosRepo';
import { supabase } from './supabase';
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

export type DataSource = 'mock' | 'supabase';

export const resolveDataSource = (): DataSource => {
  const forced = import.meta.env.VITE_DATA_SOURCE as string | undefined;
  if (forced === 'mock') return 'mock';
  if (forced === 'supabase') return supabase ? 'supabase' : 'mock';
  // Default: mock con CSV Manizales (Free-friendly). Activar supabase explícitamente.
  return 'mock';
};

type StoreLike = {
  getAll: () => UsuarioConTramites[] | Promise<UsuarioConTramites[]>;
  getUsuario: (id: number) => UsuarioConTramites | undefined | Promise<UsuarioConTramites | undefined>;
  getTramite: (id: string) => Tramite | undefined | Promise<Tramite | undefined>;
  getComunicaciones: (
    usuarioId: number,
    tramiteId?: string
  ) => Comunicacion[] | Promise<Comunicacion[]>;
  createComunicacion: (
    data: Omit<Comunicacion, 'id'> & { id?: string }
  ) => Comunicacion | Promise<Comunicacion>;
  updateComunicacion?: (
    id: string,
    updates: Partial<Comunicacion>
  ) => Comunicacion | Promise<Comunicacion>;
  deleteComunicacion: (id: string) => void | Promise<void>;
  getNotasAgenda: () => AgendaNota[] | Promise<AgendaNota[]>;
  createNotaAgenda: (
    data: Omit<AgendaNota, 'id' | 'creadoEn' | 'hecho'> & { hecho?: boolean }
  ) => AgendaNota | Promise<AgendaNota>;
  updateNotaAgenda: (
    id: string,
    updates: Partial<AgendaNota>
  ) => AgendaNota | Promise<AgendaNota>;
  deleteNotaAgenda: (id: string) => void | Promise<void>;
  getSnapshot: () =>
    | {
        usuarios: Usuario[];
        tramites: Tramite[];
        comunicaciones: Comunicacion[];
        notasAgenda: AgendaNota[];
      }
    | Promise<{
        usuarios: Usuario[];
        tramites: Tramite[];
        comunicaciones: Comunicacion[];
        notasAgenda: AgendaNota[];
      }>;
  createUsuario: (
    data: Parameters<typeof mockUserStore.createUsuario>[0]
  ) => UsuarioConTramites | Promise<UsuarioConTramites>;
  updateUsuario: (
    id: number,
    updates: Partial<Usuario>
  ) => UsuarioConTramites | Promise<UsuarioConTramites>;
  deleteUsuario: (id: number) => void | Promise<void>;
  updateTramite: (id: string, updates: Partial<Tramite>) => Tramite | Promise<Tramite>;
  updateEtapa: (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    updates: Partial<EtapaTramite> & { checklist?: ChecklistItem[] }
  ) => Tramite | Promise<Tramite>;
  setEtapaActual: (tramiteId: string, etapaTipo: TipoEtapa) => Tramite | Promise<Tramite>;
  createCasoAdicional: (
    usuarioId: number,
    data: Parameters<typeof mockUserStore.createCasoAdicional>[1]
  ) => Tramite | Promise<Tramite>;
  upsertDocumento: (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string,
    archivo: DocumentoArchivo
  ) => Tramite | Promise<Tramite>;
  removeDocumento: (
    tramiteId: string,
    etapaTipo: TipoEtapa,
    checklistItemId: string
  ) => Tramite | Promise<Tramite>;
  getStats: () => ReturnType<typeof mockUserStore.getStats> | Promise<ReturnType<typeof mockUserStore.getStats>>;
};

export const getDataStore = (): StoreLike => {
  const source = resolveDataSource();
  if (source === 'supabase') return usuariosRepo as unknown as StoreLike;
  return mockUserStore as unknown as StoreLike;
};

export const getActiveDataSource = resolveDataSource;
