import { TareaAsignado } from '../types/tarea';

const STAFF_TOKENS: { id: TareaAsignado; patterns: RegExp[] }[] = [
  { id: 'giovanni', patterns: [/\bgiovanni\b/i, /\bdon\s+giovanni\b/i] },
  { id: 'leidy', patterns: [/\bleidy\b/i] },
  { id: 'salome', patterns: [/\bsalom[eé]\b/i] }
];

/** Normaliza nombres para match cliente ↔ Excel */
export const normalizePersonName = (raw?: string): string =>
  String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Inferencia de asignado desde texto de alcance/tarea.
 * 0 o >1 staff del equipo → por_asignar.
 */
export const inferAsignadoFromText = (blobRaw?: string): TareaAsignado => {
  const blob = String(blobRaw || '');
  const hits = STAFF_TOKENS.filter((s) => s.patterns.some((re) => re.test(blob))).map(
    (s) => s.id
  );
  if (hits.length === 1) return hits[0];
  return 'por_asignar';
};

export const shortTituloFromDetalle = (detalle: string, max = 72): string => {
  const clean = detalle.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
};
