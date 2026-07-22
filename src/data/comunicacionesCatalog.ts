import {
  DireccionComunicacion,
  TipoComunicacion
} from '../types/tramite';

export const TIPOS_COMUNICACION: {
  id: TipoComunicacion;
  label: string;
  short: string;
}[] = [
  { id: 'mensaje', label: 'Mensaje (WhatsApp / SMS)', short: 'Mensaje' },
  { id: 'llamada', label: 'Llamada telefónica', short: 'Llamada' },
  { id: 'correo', label: 'Correo electrónico', short: 'Correo' },
  { id: 'visita_oficina', label: 'Visita a la oficina', short: 'Visita oficina' },
  { id: 'visita_cliente', label: 'Visita al cliente', short: 'Visita cliente' }
];

export const DIRECCIONES_COMUNICACION: {
  id: DireccionComunicacion;
  label: string;
}[] = [
  { id: 'hacia_cliente', label: 'Nosotros → Cliente' },
  { id: 'desde_cliente', label: 'Cliente → Nosotros' }
];

export const getTipoComunicacionLabel = (tipo: TipoComunicacion, short = false): string => {
  const found = TIPOS_COMUNICACION.find((t) => t.id === tipo);
  if (!found) return tipo;
  return short ? found.short : found.label;
};

export const getDireccionLabel = (direccion: DireccionComunicacion): string =>
  DIRECCIONES_COMUNICACION.find((d) => d.id === direccion)?.label || direccion;
