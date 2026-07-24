export type TipoAgendaNota = 'recordatorio' | 'novedad';

export interface AgendaNota {
  id: string;
  tipo: TipoAgendaNota;
  /** Fecha calendario YYYY-MM-DD */
  fecha: string;
  titulo: string;
  detalle?: string;
  usuarioId?: number;
  tramiteId?: string;
  hecho: boolean;
  creadoPor?: string;
  creadoEn: string;
}

export type TipoAgendaItem =
  | 'recordatorio'
  | 'novedad'
  | 'caducidad'
  | 'etapa'
  | 'comunicacion';

export type PrioridadAgenda = 'critica' | 'alta' | 'media' | 'baja';

export interface AgendaItem {
  id: string;
  tipo: TipoAgendaItem;
  fecha: string;
  titulo: string;
  detalle?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  tramiteId?: string;
  tramiteTitulo?: string;
  hecho?: boolean;
  prioridad: PrioridadAgenda;
  /** Solo notas editables */
  editable: boolean;
  /** Referencia a la nota manual si aplica */
  notaId?: string;
}
