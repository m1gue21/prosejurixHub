import { StaffId } from '../data/staffCatalog';

export type TareaEstado = 'pendiente' | 'en_curso' | 'hecha' | 'bloqueada';
export type TareaOrigen = 'excel' | 'manual';

/** Quién debe ejecutar la tarea */
export type TareaAsignado = StaffId | 'por_asignar' | 'cliente';

export interface Tarea {
  id: string;
  titulo: string;
  detalle?: string;
  estado: TareaEstado;
  asignadoA: TareaAsignado;
  usuarioId?: number;
  tramiteId?: string;
  /** Fecha límite opcional YYYY-MM-DD */
  fechaLimite?: string;
  prioridad?: 'alta' | 'media' | 'baja';
  origen: TareaOrigen;
  /** Clave estable del Excel para reimport idempotente */
  origenKey?: string;
  creadoPor?: string;
  creadoEn: string;
  actualizadoEn?: string;
}
