import { createInitialEtapas } from '../data/tramitesCatalog';
import { computeCaducidadFromAccidente } from './caducidad';
import { createDocumentoFromUrl } from './documentHelpers';
import {
  EstadoGeneralTramite,
  EtapaTramite,
  TipoEtapa,
  Tramite,
  Usuario
} from '../types/tramite';

export interface ManizalesRow {
  nombre: string;
  cedula: string;
  telefono?: string;
  celular?: string;
  celularSecundario?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  claseProceso?: string;
  responsabilidad?: string;
  fechaAccidente?: string;
  caducidad?: string;
  lugarAccidente?: string;
  ciudadAccidente?: string;
  fechaQuerella?: string;
  fiscalia?: string;
  ciudadFiscalia?: string;
  radicado?: string;
  estado?: string;
  aseguradora?: string;
  actuacion?: string;
  alcance?: string;
  fechaReclamacion?: string;
  conciliacion?: string;
  fechaPresentacionDemanda?: string;
  juzgado?: string;
  rama?: string;
  radicadoJuzgado?: string;
  ciudadJuzgado?: string;
  estadoProceso?: string;
  prestamos?: string;
  gestion?: string;
  denunciaUrl?: string;
  dictamenUrl?: string;
  reclamacionUrl?: string;
  conciliacionUrl?: string;
  demandaUrl?: string;
  source: 'control' | 'activos';
}

export interface ManizalesSeed {
  usuarios: Usuario[];
  tramites: Tramite[];
  stats: {
    controlRows: number;
    activosRows: number;
    usuarios: number;
    tramites: number;
    soloControl: number;
    soloActivos: number;
    merged: number;
    sinCedula: number;
  };
}

/** CSV parser que respeta comillas y columnas por índice */
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };
  const pushRow = () => {
    // Ignorar filas totalmente vacías
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
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
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

export const normalizeCedula = (raw?: string): string => {
  if (!raw) return '';
  return raw
    .replace(/T\.?\s*I\.?/gi, '')
    .replace(/[^\d]/g, '')
    .trim();
};

/** Corrige días inválidos (p. ej. 29/02 en año no bisiesto → 28/02). */
export const toValidIsoDate = (
  year: number | string,
  month: number | string,
  day: number | string
): string | undefined => {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1) return undefined;
  const lastDay = new Date(y, m, 0).getDate();
  const safeDay = Math.min(d, lastDay);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(safeDay)}`;
};

export const parseDateEs = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const v = raw.trim();
  if (!v || /^n\/?a$/i.test(v) || v === '-' || v.toLowerCase() === 'sin querella') {
    return undefined;
  }
  // DD/MM/YYYY or D/M/YYYY
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (m) {
    return toValidIsoDate(m[3], m[2], m[1]);
  }
  // already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    const iso = v.slice(0, 10);
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!parts) return undefined;
    return toValidIsoDate(parts[1], parts[2], parts[3]);
  }
  return undefined;
};

export const normalizeResponsabilidad = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if (v.includes('extra')) return 'Extracontractual';
  if (v.includes('contract')) return 'Contractual';
  if (v.includes('reparac') || v.includes('laboral')) return raw.trim();
  return raw.trim();
};

export const normalizeEstadoGeneral = (raw?: string): EstadoGeneralTramite => {
  const v = (raw || '').toLowerCase();
  if (v.includes('inactiv') || v.includes('final') || v.includes('cerrad') || v === 'n/a') {
    return 'finalizado';
  }
  if (v.includes('espera')) return 'en_espera';
  return 'activo';
};

const cell = (cols: string[], idx: number) => (cols[idx] || '').trim();

const isDriveUrl = (v?: string) => Boolean(v && v.includes('drive.google.com'));

export const parseControlRow = (cols: string[]): ManizalesRow | null => {
  const nombre = cell(cols, 0);
  if (!nombre || nombre.toUpperCase() === 'NOMBRE') return null;
  return {
    nombre,
    cedula: cell(cols, 1) || cell(cols, 2),
    celular: cell(cols, 3) || undefined,
    celularSecundario: cell(cols, 4) || undefined,
    email: cell(cols, 5) || undefined,
    direccion: cell(cols, 6) || undefined,
    ciudad: cell(cols, 7) || undefined,
    claseProceso: cell(cols, 8) || undefined,
    responsabilidad: cell(cols, 9) || undefined,
    fechaAccidente: cell(cols, 10) || undefined,
    caducidad: cell(cols, 11) || undefined,
    lugarAccidente: cell(cols, 12) || undefined,
    ciudadAccidente: cell(cols, 13) || undefined,
    fechaQuerella: cell(cols, 14) || undefined,
    fiscalia: cell(cols, 15) || undefined,
    ciudadFiscalia: cell(cols, 16) || undefined,
    radicado: cell(cols, 17) || undefined,
    estado: cell(cols, 18) || undefined,
    aseguradora: cell(cols, 19) || undefined,
    actuacion: cell(cols, 20) || undefined,
    fechaReclamacion: cell(cols, 21) || undefined,
    conciliacion: cell(cols, 22) || undefined,
    fechaPresentacionDemanda: cell(cols, 23) || undefined,
    juzgado: cell(cols, 24) || undefined,
    rama: cell(cols, 25) || undefined,
    radicadoJuzgado: cell(cols, 26) || undefined,
    ciudadJuzgado: cell(cols, 27) || undefined,
    estadoProceso: cell(cols, 28) || undefined,
    prestamos: cell(cols, 29) || undefined,
    source: 'control'
  };
};

export const parseActivosRow = (cols: string[]): ManizalesRow | null => {
  const nombre = cell(cols, 0);
  if (!nombre || nombre.toUpperCase() === 'NOMBRE') return null;
  return {
    nombre,
    cedula: cell(cols, 1),
    telefono: cell(cols, 2) || undefined,
    celular: cell(cols, 3) || undefined,
    celularSecundario: cell(cols, 4) || undefined,
    email: cell(cols, 5) || undefined,
    direccion: cell(cols, 6) || undefined,
    ciudad: cell(cols, 7) || undefined,
    claseProceso: cell(cols, 8) || undefined,
    responsabilidad: cell(cols, 9) || undefined,
    fechaAccidente: cell(cols, 10) || undefined,
    caducidad: cell(cols, 11) || undefined,
    lugarAccidente: cell(cols, 12) || undefined,
    ciudadAccidente: cell(cols, 13) || undefined,
    fechaQuerella: cell(cols, 14) || undefined,
    fiscalia: cell(cols, 15) || undefined,
    ciudadFiscalia: cell(cols, 16) || undefined,
    radicado: cell(cols, 17) || undefined,
    estado: cell(cols, 18) || undefined,
    aseguradora: cell(cols, 19) || undefined,
    actuacion: cell(cols, 20) || undefined,
    alcance: cell(cols, 21) || undefined,
    fechaReclamacion: cell(cols, 22) || undefined,
    conciliacion: cell(cols, 23) || undefined,
    fechaPresentacionDemanda: cell(cols, 24) || undefined,
    juzgado: cell(cols, 25) || undefined,
    rama: cell(cols, 26) || undefined,
    radicadoJuzgado: cell(cols, 27) || undefined,
    ciudadJuzgado: cell(cols, 28) || undefined,
    estadoProceso: cell(cols, 29) || undefined,
    prestamos: cell(cols, 30) || undefined,
    gestion: cell(cols, 31) || undefined,
    denunciaUrl: isDriveUrl(cell(cols, 32)) ? cell(cols, 32) : undefined,
    dictamenUrl: isDriveUrl(cell(cols, 33)) ? cell(cols, 33) : undefined,
    reclamacionUrl: isDriveUrl(cell(cols, 34)) ? cell(cols, 34) : undefined,
    conciliacionUrl: isDriveUrl(cell(cols, 35)) ? cell(cols, 35) : undefined,
    demandaUrl: isDriveUrl(cell(cols, 36)) ? cell(cols, 36) : undefined,
    source: 'activos'
  };
};

export const rowKey = (r: ManizalesRow): string => {
  const ced = normalizeCedula(r.cedula) || 'sin-cedula';
  const fecha = parseDateEs(r.fechaAccidente) || 'sin-fecha';
  const rad = (r.radicado || '').replace(/\s+/g, '').toLowerCase() || 'sin-rad';
  return `${ced}|${fecha}|${rad}`;
};

const prefer = (a?: string, b?: string) => {
  const av = (a || '').trim();
  const bv = (b || '').trim();
  if (av && !/^n\/?a$/i.test(av)) return av;
  return bv || undefined;
};

export const mergeRows = (base: ManizalesRow, enrich: ManizalesRow): ManizalesRow => ({
  ...base,
  ...Object.fromEntries(
    Object.entries(enrich).map(([k, v]) => [k, v || (base as Record<string, unknown>)[k]])
  ),
  nombre: prefer(enrich.nombre, base.nombre) || base.nombre,
  cedula: prefer(enrich.cedula, base.cedula) || base.cedula,
  telefono: prefer(enrich.telefono, base.telefono),
  celular: prefer(enrich.celular, base.celular),
  celularSecundario: prefer(enrich.celularSecundario, base.celularSecundario),
  email: prefer(enrich.email, base.email),
  direccion: prefer(enrich.direccion, base.direccion),
  ciudad: prefer(enrich.ciudad, base.ciudad),
  aseguradora: prefer(enrich.aseguradora, base.aseguradora),
  actuacion: prefer(enrich.actuacion, base.actuacion),
  alcance: prefer(enrich.alcance, base.alcance),
  gestion: prefer(enrich.gestion, base.gestion),
  denunciaUrl: enrich.denunciaUrl || base.denunciaUrl,
  dictamenUrl: enrich.dictamenUrl || base.dictamenUrl,
  reclamacionUrl: enrich.reclamacionUrl || base.reclamacionUrl,
  conciliacionUrl: enrich.conciliacionUrl || base.conciliacionUrl,
  demandaUrl: enrich.demandaUrl || base.demandaUrl,
  source: 'activos'
});

export const inferEtapaFromText = (blobRaw: string, estado?: string): TipoEtapa => {
  const blob = blobRaw.toLowerCase();
  if (estado === 'finalizado' || blob.includes('paz y salvo') || blob.includes('cerrado')) {
    if (blob.includes('demanda') || blob.includes('judicial') || blob.includes('sentencia')) {
      return 'proceso_judicial';
    }
    return 'reclamacion_aseguradora';
  }
  if (blob.includes('demanda') || blob.includes('judicial') || blob.includes('audiencia') || blob.includes('juzgado')) {
    return 'proceso_judicial';
  }
  if (blob.includes('concili')) return 'conciliacion_prejudicial';
  if (blob.includes('dictamen') || blob.includes('medicina legal')) return 'medico_legal';
  if (blob.includes('reclam') || blob.includes('asegur')) return 'reclamacion_aseguradora';
  if (blob.includes('querella') || blob.includes('fiscal')) return 'accion_penal';
  return 'accion_penal';
};

const applyEtapaProgress = (
  etapas: EtapaTramite[],
  actual: TipoEtapa,
  row: ManizalesRow
): EtapaTramite[] => {
  const order = [
    'vinculacion',
    'liberacion_vehiculos',
    'accion_penal',
    'medico_clinico',
    'medico_legal',
    'reclamacion_aseguradora',
    'medico_laboral',
    'conciliacion_prejudicial',
    'proceso_judicial'
  ] as TipoEtapa[];
  const idx = order.indexOf(actual);
  const today = parseDateEs(row.fechaAccidente) || new Date().toISOString().slice(0, 10);

  return etapas.map((e) => {
    if (e.estado === 'no_aplica') return e;
    const eIdx = order.indexOf(e.tipo);
    if (eIdx < idx) {
      return { ...e, estado: 'completada' as const, fechaInicio: e.fechaInicio || today, fechaFin: e.fechaFin || today };
    }
    if (e.tipo === actual) {
      return { ...e, estado: 'en_curso' as const, fechaInicio: e.fechaInicio || today };
    }
    return e;
  });
};

const attachDriveDocs = (etapas: EtapaTramite[], row: ManizalesRow): EtapaTramite[] => {
  const docs: { etapa: TipoEtapa; itemId: string; url: string; nombre: string }[] = [];
  if (row.denunciaUrl) {
    docs.push({ etapa: 'accion_penal', itemId: 'querella', url: row.denunciaUrl, nombre: 'denuncia.pdf' });
  }
  if (row.dictamenUrl) {
    docs.push({ etapa: 'medico_legal', itemId: 'dictamen', url: row.dictamenUrl, nombre: 'dictamen.pdf' });
  }
  if (row.reclamacionUrl) {
    docs.push({
      etapa: 'reclamacion_aseguradora',
      itemId: 'reclamacion',
      url: row.reclamacionUrl,
      nombre: 'reclamacion.pdf'
    });
  }
  if (row.conciliacionUrl) {
    docs.push({
      etapa: 'conciliacion_prejudicial',
      itemId: 'acta',
      url: row.conciliacionUrl,
      nombre: 'conciliacion.pdf'
    });
  }
  if (row.demandaUrl) {
    docs.push({ etapa: 'proceso_judicial', itemId: 'demanda', url: row.demandaUrl, nombre: 'demanda.pdf' });
  }

  return etapas.map((etapa) => {
    const matches = docs.filter((d) => d.etapa === etapa.tipo);
    if (!matches.length) return etapa;
    return {
      ...etapa,
      checklist: etapa.checklist.map((item) => {
        const doc = matches.find((m) => item.id.includes(m.itemId) || m.itemId.includes(item.id));
        if (!doc && matches[0] && item.requiereDocumento && !item.archivo) {
          // attach first drive doc of etapa to first required item without file
          const first = matches.shift();
          if (!first) return item;
          return {
            ...item,
            completado: true,
            archivo: createDocumentoFromUrl(first.nombre, first.url)
          };
        }
        if (!doc) return item;
        return {
          ...item,
          completado: true,
          archivo: createDocumentoFromUrl(doc.nombre, doc.url)
        };
      })
    };
  });
};

export const mergeManizalesCsvs = (controlText: string, activosText: string): ManizalesSeed => {
  const controlRows = parseCsv(controlText)
    .slice(1)
    .map(parseControlRow)
    .filter((r): r is ManizalesRow => Boolean(r));
  const activosRows = parseCsv(activosText)
    .slice(1)
    .map(parseActivosRow)
    .filter((r): r is ManizalesRow => Boolean(r));

  const map = new Map<string, ManizalesRow>();
  let sinCedula = 0;
  let soloControl = 0;
  let soloActivos = 0;
  let merged = 0;

  for (const row of controlRows) {
    if (!normalizeCedula(row.cedula)) sinCedula++;
    map.set(rowKey(row), row);
    soloControl++;
  }

  for (const row of activosRows) {
    if (!normalizeCedula(row.cedula)) sinCedula++;
    const key = rowKey(row);
    const existing = map.get(key);
    if (existing) {
      map.set(key, mergeRows(existing, row));
      soloControl--;
      merged++;
    } else {
      map.set(key, row);
      soloActivos++;
    }
  }

  const mergedRows = [...map.values()];
  const byCedula = new Map<string, ManizalesRow[]>();
  for (const row of mergedRows) {
    const ced = normalizeCedula(row.cedula) || `nombre:${row.nombre.toLowerCase()}`;
    const list = byCedula.get(ced) || [];
    list.push(row);
    byCedula.set(ced, list);
  }

  const usuarios: Usuario[] = [];
  const tramites: Tramite[] = [];
  let nextId = 1;
  let tCounter = 1;

  for (const [cedKey, rows] of byCedula) {
    const primary = rows[0];
    const cedula = normalizeCedula(primary.cedula) || cedKey.replace(/^nombre:/, '');
    const usuarioId = nextId++;
    const fechaVinculacion =
      parseDateEs(primary.fechaQuerella) ||
      parseDateEs(primary.fechaAccidente) ||
      new Date().toISOString().slice(0, 10);

    usuarios.push({
      id: usuarioId,
      nombre: primary.nombre,
      cedula,
      telefono: primary.telefono,
      celular: primary.celular,
      celularSecundario: primary.celularSecundario,
      email: primary.email,
      direccion: primary.direccion,
      ciudad: primary.ciudad,
      fechaVinculacion,
      poderesFirmados: true,
      casoEntregado: true,
      tieneVehiculoInvolucrado: false
    });

    rows.forEach((row, index) => {
      const responsabilidad = normalizeResponsabilidad(row.responsabilidad);
      const fechaAccidente = parseDateEs(row.fechaAccidente);
      const caducidad =
        parseDateEs(row.caducidad) ||
        computeCaducidadFromAccidente(fechaAccidente, responsabilidad) ||
        undefined;
      const blob = [row.actuacion, row.gestion, row.alcance, row.estadoProceso, row.estado]
        .filter(Boolean)
        .join(' ');
      const estadoGeneral = normalizeEstadoGeneral(row.estado);
      const etapaActual = inferEtapaFromText(blob, estadoGeneral);
      let etapas = createInitialEtapas(false);
      etapas = applyEtapaProgress(etapas, etapaActual, row);
      etapas = attachDriveDocs(etapas, row);

      const origenKey = rowKey(row);
      tramites.push({
        id: `t-m-${tCounter++}`,
        usuarioId,
        titulo: row.claseProceso || row.aseguradora || `Caso ${row.nombre}`,
        casoLabel: [row.aseguradora, fechaAccidente].filter(Boolean).join(' · ') || undefined,
        estadoGeneral,
        etapaActual,
        esCasoAdicional: index > 0,
        fechaAccidente,
        lugarAccidente: row.lugarAccidente,
        responsabilidad,
        caducidad,
        aseguradora: row.aseguradora,
        radicado: row.radicado,
        fiscalia: row.fiscalia,
        juzgado: row.juzgado,
        alcance: row.alcance,
        gestion: row.gestion,
        observacionesInternas: [row.actuacion, row.estadoProceso].filter(Boolean).join(' · ') || undefined,
        observacionesCliente:
          estadoGeneral === 'activo'
            ? 'Tu caso está en seguimiento. Pronto tendrás novedades.'
            : undefined,
        fechaIngreso: fechaVinculacion,
        origenKey,
        etapas
      });
    });
  }

  return {
    usuarios,
    tramites,
    stats: {
      controlRows: controlRows.length,
      activosRows: activosRows.length,
      usuarios: usuarios.length,
      tramites: tramites.length,
      soloControl: Math.max(0, soloControl),
      soloActivos,
      merged,
      sinCedula
    }
  };
};
