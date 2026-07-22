export type EstadoGeneralTramite = 'activo' | 'en_espera' | 'finalizado';

export type TipoEtapa =
  | 'vinculacion'
  | 'liberacion_vehiculos'
  | 'accion_penal'
  | 'medico_clinico'
  | 'medico_legal'
  | 'reclamacion_aseguradora'
  | 'medico_laboral'
  | 'conciliacion_prejudicial'
  | 'proceso_judicial';

export type EstadoEtapa =
  | 'pendiente'
  | 'en_curso'
  | 'completada'
  | 'no_aplica'
  | 'omitida';

export type SubestadoReclamacion =
  | 'radicacion'
  | 'complementacion'
  | 'negociacion'
  | 'concertacion'
  | 'fracaso'
  | 'finalizacion';

export type SubestadoConciliacion =
  | 'radicacion_solicitud'
  | 'diligencia'
  | 'concertacion'
  | 'fracaso'
  | 'acta';

export type SubestadoJudicial =
  | 'radicacion_demanda'
  | 'admision_subsanacion'
  | 'notificaciones'
  | 'contestacion'
  | 'pronunciamiento'
  | 'audiencia_inicial'
  | 'conciliacion'
  | 'desarrollo'
  | 'sentencia';

export type SubestadoMedicoLaboral =
  | 'agendamiento'
  | 'complementacion_hc'
  | 'dictamen_pcl';

export type SubestadoEtapa =
  | SubestadoReclamacion
  | SubestadoConciliacion
  | SubestadoJudicial
  | SubestadoMedicoLaboral
  | string;

export interface DocumentoArchivo {
  id: string;
  nombre: string;
  mimeType: string;
  size: number;
  fechaAnadido: string;
  /** Contenido local (data URL) para demo sin backend */
  dataUrl?: string;
  /** Enlace externo (Drive, etc.) */
  urlExterna?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completado: boolean;
  /** Si true, requiere archivo real (no solo check) */
  requiereDocumento: boolean;
  archivo?: DocumentoArchivo;
}

export interface EtapaTramite {
  id: string;
  tipo: TipoEtapa;
  estado: EstadoEtapa;
  subestado?: SubestadoEtapa;
  fechaInicio?: string;
  fechaFin?: string;
  notasInternas?: string;
  notasCliente?: string;
  checklist: ChecklistItem[];
}

export interface Usuario {
  id: number;
  nombre: string;
  cedula: string;
  telefono?: string;
  celular?: string;
  celularSecundario?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  fechaVinculacion: string;
  poderesFirmados: boolean;
  casoEntregado: boolean;
  tieneVehiculoInvolucrado: boolean;
}

export interface Tramite {
  id: string;
  usuarioId: number;
  titulo: string;
  casoLabel?: string;
  estadoGeneral: EstadoGeneralTramite;
  etapaActual: TipoEtapa;
  esCasoAdicional: boolean;
  fechaAccidente?: string;
  lugarAccidente?: string;
  responsabilidad?: string;
  aseguradora?: string;
  radicado?: string;
  fiscalia?: string;
  juzgado?: string;
  placaVehiculo?: string;
  demandado?: string;
  valorHonorarios?: number;
  valorPeritaje?: number;
  valorPrestamos?: number;
  gastosAdicionales?: number;
  observaciones?: string;
  observacionesInternas?: string;
  observacionesCliente?: string;
  fechaIngreso: string;
  etapas: EtapaTramite[];
}

export interface UsuarioConTramites extends Usuario {
  tramites: Tramite[];
}

/** Canal de la comunicación con el cliente */
export type TipoComunicacion =
  | 'mensaje'
  | 'llamada'
  | 'correo'
  | 'visita_oficina'
  | 'visita_cliente';

/** Quién inició el contacto */
export type DireccionComunicacion = 'hacia_cliente' | 'desde_cliente';

export interface Comunicacion {
  id: string;
  usuarioId: number;
  /** Opcional: asociar al trámite concreto */
  tramiteId?: string;
  tipo: TipoComunicacion;
  direccion: DireccionComunicacion;
  /** Fecha/hora ISO */
  fecha: string;
  asunto?: string;
  contenido: string;
  /** Quién registró (equipo) */
  registradoPor?: string;
  /** Duración en minutos (llamadas / visitas) */
  duracionMinutos?: number;
}
