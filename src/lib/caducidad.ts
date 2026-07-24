import { TipoResponsabilidad, Tramite } from '../types/tramite';

export type UrgenciaCaducidad =
  | 'vencida'
  | 'critica'
  | 'alerta'
  | 'ok'
  | 'sin_datos';

export interface CaducidadInfo {
  tipo: TipoResponsabilidad | null;
  aniosPlazo: number | null;
  fechaBase: string | null;
  /** Accidente si existe; si no, estructuración como referencia de caso */
  fechaAccidente?: string;
  fechaEstructuracion?: string;
  caducidad: string | null;
  diasRestantes: number | null;
  urgencia: UrgenciaCaducidad;
  labelUrgencia: string;
  reglaLabel: string;
}

const MS_DAY = 24 * 60 * 60 * 1000;

export const parseTipoResponsabilidad = (
  value?: string | null
): TipoResponsabilidad | null => {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v.includes('extra')) return 'extracontractual';
  if (v.includes('contract')) return 'contractual';
  return null;
};

export const labelTipoResponsabilidad = (tipo: TipoResponsabilidad | null): string => {
  if (tipo === 'contractual') return 'Contractual';
  if (tipo === 'extracontractual') return 'Extracontractual';
  return 'Sin definir';
};

export const aniosPorTipo = (tipo: TipoResponsabilidad | null): number | null => {
  if (tipo === 'contractual') return 2;
  if (tipo === 'extracontractual') return 5;
  return null;
};

export const addYearsIso = (isoDate: string, years: number): string | null => {
  const d = parseLocalDate(isoDate);
  if (!d) return null;
  const day = d.getDate();
  d.setFullYear(d.getFullYear() + years);
  // Si partimos de 29/02 y el destino no es bisiesto, JS puede pasar a 01/03;
  // preferimos el último día de febrero.
  if (day === 29 && d.getMonth() === 2 && d.getDate() === 1) {
    d.setDate(0); // último día de febrero
  }
  return toIsoDate(d);
};

export const addMonthsIso = (isoDate: string, months: number): string | null => {
  const d = parseLocalDate(isoDate);
  if (!d) return null;
  d.setMonth(d.getMonth() + months);
  return toIsoDate(d);
};

export const parseLocalDate = (isoDate?: string | null): Date | null => {
  if (!isoDate) return null;
  const raw = isoDate.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) {
    const fallback = new Date(isoDate);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};

export const toIsoDate = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatFechaEs = (isoDate?: string | null): string => {
  const d = parseLocalDate(isoDate);
  if (!d) return '—';
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const computeCaducidadFromAccidente = (
  fechaAccidente?: string | null,
  responsabilidad?: string | null
): string | null => {
  const tipo = parseTipoResponsabilidad(responsabilidad);
  const years = aniosPorTipo(tipo);
  if (!fechaAccidente || years == null) return null;
  return addYearsIso(fechaAccidente, years);
};

export const getCaducidadInfo = (tramite: Pick<
  Tramite,
  'fechaAccidente' | 'fechaEstructuracion' | 'responsabilidad' | 'caducidad'
>): CaducidadInfo => {
  const tipo = parseTipoResponsabilidad(tramite.responsabilidad);
  const aniosPlazo = aniosPorTipo(tipo);
  const fechaAccidente = tramite.fechaAccidente || undefined;
  const fechaEstructuracion = tramite.fechaEstructuracion || undefined;
  const fechaBase = fechaAccidente || null;

  const calculated = computeCaducidadFromAccidente(fechaAccidente, tramite.responsabilidad);
  const caducidad = calculated || tramite.caducidad || null;

  if (!fechaBase || !tipo || !caducidad) {
    return {
      tipo,
      aniosPlazo,
      fechaBase,
      fechaAccidente,
      fechaEstructuracion,
      caducidad,
      diasRestantes: null,
      urgencia: 'sin_datos',
      labelUrgencia: 'Faltan datos clave',
      reglaLabel: tipo
        ? `${labelTipoResponsabilidad(tipo)} · ${aniosPlazo} años desde el accidente`
        : 'Define si es contractual (2 años) o extracontractual (5 años)'
    };
  }

  const end = parseLocalDate(caducidad);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diasRestantes = end
    ? Math.ceil((end.getTime() - today.getTime()) / MS_DAY)
    : null;

  let urgencia: UrgenciaCaducidad = 'ok';
  let labelUrgencia = 'Dentro del plazo';
  if (diasRestantes == null) {
    urgencia = 'sin_datos';
    labelUrgencia = 'Faltan datos clave';
  } else if (diasRestantes < 0) {
    urgencia = 'vencida';
    labelUrgencia = `Vencida hace ${Math.abs(diasRestantes)} días`;
  } else if (diasRestantes <= 90) {
    urgencia = 'critica';
    labelUrgencia = `${diasRestantes} días restantes`;
  } else if (diasRestantes <= 180) {
    urgencia = 'alerta';
    labelUrgencia = `${diasRestantes} días restantes`;
  } else {
    labelUrgencia = `${diasRestantes} días restantes`;
  }

  return {
    tipo,
    aniosPlazo,
    fechaBase,
    fechaAccidente,
    fechaEstructuracion,
    caducidad,
    diasRestantes,
    urgencia,
    labelUrgencia,
    reglaLabel: `${labelTipoResponsabilidad(tipo)} · ${aniosPlazo} años desde el accidente`
  };
};

export const urgenciaStyles: Record<
  UrgenciaCaducidad,
  { panel: string; badge: string; accent: string }
> = {
  vencida: {
    panel: 'border-rose-300 bg-rose-50',
    badge: 'bg-rose-600 text-white',
    accent: 'text-rose-800'
  },
  critica: {
    panel: 'border-orange-300 bg-orange-50',
    badge: 'bg-orange-600 text-white',
    accent: 'text-orange-900'
  },
  alerta: {
    panel: 'border-amber-300 bg-amber-50',
    badge: 'bg-amber-500 text-white',
    accent: 'text-amber-950'
  },
  ok: {
    panel: 'border-emerald-200 bg-emerald-50/70',
    badge: 'bg-emerald-600 text-white',
    accent: 'text-emerald-900'
  },
  sin_datos: {
    panel: 'border-slate-300 bg-slate-50',
    badge: 'bg-slate-600 text-white',
    accent: 'text-slate-800'
  }
};

/** Orden para listas: primero lo más urgente */
export const urgenciaRank = (u: UrgenciaCaducidad): number => {
  switch (u) {
    case 'vencida':
      return 0;
    case 'critica':
      return 1;
    case 'alerta':
      return 2;
    case 'sin_datos':
      return 3;
    default:
      return 4;
  }
};
