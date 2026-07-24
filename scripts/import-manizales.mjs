/**
 * Importa CONTROL + ACTIVOS a seed local y opcionalmente a Supabase.
 *
 * Uso:
 *   node scripts/import-manizales.mjs
 *   node scripts/import-manizales.mjs --supabase
 *
 * Requiere para --supabase:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (o VITE_SUPABASE_ANON_KEY en piloto Free)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const CONTROL = resolve(
  root,
  'actualizadoPROCESOS MANIZALES.xlsx - CONTROL PROCESOS ACCIDENTES(1).csv'
);
const ACTIVOS = resolve(root, 'actualizadoPROCESOS MANIZALES.xlsx - ACTIVOS(1).csv');
const OUT_JSON = resolve(root, 'src/data/generatedManizalesSeed.json');

// Duplicamos la lógica de parse mínimo en el script para no depender de TS runtime.
// El seed de la app usa src/lib/csvManizales.ts vía Vite.

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const pushCell = () => {
    row.push(cell);
    cell = '';
  };
  const pushRow = () => {
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
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
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

const normalizeCedula = (raw) =>
  String(raw || '')
    .replace(/T\.?\s*I\.?/gi, '')
    .replace(/[^\d]/g, '')
    .trim();

const toValidIsoDate = (year, month, day) => {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1) return null;
  const lastDay = new Date(y, m, 0).getDate();
  const safeDay = Math.min(d, lastDay);
  return `${y}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
};

const parseDateEs = (raw) => {
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v || /^n\/?a$/i.test(v) || v === '-') return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (m) return toValidIsoDate(m[3], m[2], m[1]);
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    const iso = v.slice(0, 10);
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!parts) return null;
    return toValidIsoDate(parts[1], parts[2], parts[3]);
  }
  return null;
};

const cell = (cols, i) => (cols[i] || '').trim();
const isDrive = (v) => v && v.includes('drive.google.com');

const parseControl = (cols) => {
  const nombre = cell(cols, 0);
  if (!nombre || nombre.toUpperCase() === 'NOMBRE') return null;
  return {
    nombre,
    cedula: cell(cols, 1) || cell(cols, 2),
    celular: cell(cols, 3),
    celular2: cell(cols, 4),
    email: cell(cols, 5),
    direccion: cell(cols, 6),
    ciudad: cell(cols, 7),
    clase: cell(cols, 8),
    responsabilidad: cell(cols, 9),
    fechaAccidente: cell(cols, 10),
    caducidad: cell(cols, 11),
    lugar: cell(cols, 12),
    radicado: cell(cols, 17),
    estado: cell(cols, 18),
    aseguradora: cell(cols, 19),
    actuacion: cell(cols, 20),
    fiscalia: cell(cols, 15),
    juzgado: cell(cols, 24),
    estadoProceso: cell(cols, 28)
  };
};

const parseActivos = (cols) => {
  const nombre = cell(cols, 0);
  if (!nombre || nombre.toUpperCase() === 'NOMBRE') return null;
  return {
    nombre,
    cedula: cell(cols, 1),
    telefono: cell(cols, 2),
    celular: cell(cols, 3),
    celular2: cell(cols, 4),
    email: cell(cols, 5),
    direccion: cell(cols, 6),
    ciudad: cell(cols, 7),
    clase: cell(cols, 8),
    responsabilidad: cell(cols, 9),
    fechaAccidente: cell(cols, 10),
    caducidad: cell(cols, 11),
    lugar: cell(cols, 12),
    radicado: cell(cols, 17),
    estado: cell(cols, 18),
    aseguradora: cell(cols, 19),
    actuacion: cell(cols, 20),
    alcance: cell(cols, 21),
    fiscalia: cell(cols, 15),
    juzgado: cell(cols, 25),
    estadoProceso: cell(cols, 29),
    gestion: cell(cols, 31),
    denuncia: isDrive(cell(cols, 32)) ? cell(cols, 32) : '',
    dictamen: isDrive(cell(cols, 33)) ? cell(cols, 33) : '',
    reclamacion: isDrive(cell(cols, 34)) ? cell(cols, 34) : '',
    conciliacionDoc: isDrive(cell(cols, 35)) ? cell(cols, 35) : '',
    demanda: isDrive(cell(cols, 36)) ? cell(cols, 36) : ''
  };
};

const keyOf = (r) => {
  const ced = normalizeCedula(r.cedula) || 'sin';
  const fecha = parseDateEs(r.fechaAccidente) || 'sin-fecha';
  const rad = (r.radicado || '').replace(/\s+/g, '').toLowerCase() || 'sin-rad';
  return `${ced}|${fecha}|${rad}`;
};

const prefer = (a, b) => {
  const av = (a || '').trim();
  if (av && !/^n\/?a$/i.test(av)) return av;
  return (b || '').trim() || null;
};

if (!existsSync(CONTROL) || !existsSync(ACTIVOS)) {
  console.error('No se encontraron los CSV actualizados en la raíz del repo.');
  process.exit(1);
}

const control = parseCsv(readFileSync(CONTROL, 'utf8')).slice(1).map(parseControl).filter(Boolean);
const activos = parseCsv(readFileSync(ACTIVOS, 'utf8')).slice(1).map(parseActivos).filter(Boolean);

const map = new Map();
for (const r of control) map.set(keyOf(r), { ...r, source: 'control' });
let merged = 0;
let soloActivos = 0;
for (const r of activos) {
  const k = keyOf(r);
  const prev = map.get(k);
  if (prev) {
    map.set(k, {
      ...prev,
      ...r,
      nombre: prefer(r.nombre, prev.nombre),
      cedula: prefer(r.cedula, prev.cedula),
      aseguradora: prefer(r.aseguradora, prev.aseguradora),
      actuacion: prefer(r.actuacion, prev.actuacion),
      source: 'merged'
    });
    merged++;
  } else {
    map.set(k, { ...r, source: 'activos' });
    soloActivos++;
  }
}

const rows = [...map.values()];
const byCed = new Map();
for (const r of rows) {
  const ced = normalizeCedula(r.cedula) || `n:${(r.nombre || '').toLowerCase()}`;
  if (!byCed.has(ced)) byCed.set(ced, []);
  byCed.get(ced).push(r);
}

const inferEtapaFromText = (blobRaw, estado) => {
  const blob = String(blobRaw || '').toLowerCase();
  if (estado === 'finalizado' || blob.includes('paz y salvo') || blob.includes('cerrado')) {
    if (blob.includes('demanda') || blob.includes('judicial') || blob.includes('sentencia')) {
      return 'proceso_judicial';
    }
    return 'reclamacion_aseguradora';
  }
  if (
    blob.includes('demanda') ||
    blob.includes('judicial') ||
    blob.includes('audiencia') ||
    blob.includes('juzgado')
  ) {
    return 'proceso_judicial';
  }
  if (blob.includes('concili')) return 'conciliacion_prejudicial';
  if (blob.includes('dictamen') || blob.includes('medicina legal')) return 'medico_legal';
  if (blob.includes('reclam') || blob.includes('asegur')) return 'reclamacion_aseguradora';
  if (blob.includes('querella') || blob.includes('fiscal')) return 'accion_penal';
  return 'accion_penal';
};

const ETAPA_ORDER = [
  'vinculacion',
  'liberacion_vehiculos',
  'accion_penal',
  'medico_clinico',
  'medico_legal',
  'reclamacion_aseguradora',
  'medico_laboral',
  'conciliacion_prejudicial',
  'proceso_judicial'
];

const buildEtapasForTramite = (t) => {
  const actual = t.etapa_actual;
  const idx = ETAPA_ORDER.indexOf(actual);
  const today = t.fecha_accidente || t.fecha_ingreso || new Date().toISOString().slice(0, 10);
  const docByEtapa = {
    accion_penal: t._docs.denuncia
      ? {
          id: 'querella',
          label: 'Querella / denuncia',
          completado: true,
          requiereDocumento: true,
          archivo: {
            id: `doc-${t.id}-den`,
            nombre: 'denuncia.pdf',
            mimeType: 'application/pdf',
            size: 0,
            fechaAnadido: new Date().toISOString(),
            urlExterna: t._docs.denuncia
          }
        }
      : null,
    medico_legal: t._docs.dictamen
      ? {
          id: 'dictamenes',
          label: 'Dictámenes',
          completado: true,
          requiereDocumento: true,
          archivo: {
            id: `doc-${t.id}-dict`,
            nombre: 'dictamen.pdf',
            mimeType: 'application/pdf',
            size: 0,
            fechaAnadido: new Date().toISOString(),
            urlExterna: t._docs.dictamen
          }
        }
      : null,
    reclamacion_aseguradora: t._docs.reclamacion
      ? {
          id: 'reclamacion',
          label: 'Reclamación',
          completado: true,
          requiereDocumento: true,
          archivo: {
            id: `doc-${t.id}-rec`,
            nombre: 'reclamacion.pdf',
            mimeType: 'application/pdf',
            size: 0,
            fechaAnadido: new Date().toISOString(),
            urlExterna: t._docs.reclamacion
          }
        }
      : null,
    conciliacion_prejudicial: t._docs.conciliacion
      ? {
          id: 'acta',
          label: 'Acta de conciliación',
          completado: true,
          requiereDocumento: true,
          archivo: {
            id: `doc-${t.id}-conc`,
            nombre: 'conciliacion.pdf',
            mimeType: 'application/pdf',
            size: 0,
            fechaAnadido: new Date().toISOString(),
            urlExterna: t._docs.conciliacion
          }
        }
      : null,
    proceso_judicial: t._docs.demanda
      ? {
          id: 'demanda',
          label: 'Demanda',
          completado: true,
          requiereDocumento: true,
          archivo: {
            id: `doc-${t.id}-dem`,
            nombre: 'demanda.pdf',
            mimeType: 'application/pdf',
            size: 0,
            fechaAnadido: new Date().toISOString(),
            urlExterna: t._docs.demanda
          }
        }
      : null
  };

  return ETAPA_ORDER.map((tipo) => {
    const eIdx = ETAPA_ORDER.indexOf(tipo);
    let estado = 'pendiente';
    let fecha_inicio = null;
    let fecha_fin = null;
    if (tipo === 'liberacion_vehiculos') {
      estado = 'no_aplica';
    } else if (tipo === 'vinculacion' || eIdx < idx) {
      estado = 'completada';
      fecha_inicio = today;
      fecha_fin = today;
    } else if (tipo === actual) {
      estado = 'en_curso';
      fecha_inicio = today;
    }
    const checklist = [];
    const doc = docByEtapa[tipo];
    if (doc) checklist.push(doc);
    return {
      id: `${t.id}-${tipo}`,
      tramite_id: t.id,
      tipo,
      estado,
      fecha_inicio,
      fecha_fin,
      checklist
    };
  });
};

const usuarios = [];
const tramites = [];
let uid = 1;
let tid = 1;

for (const [cedKey, list] of byCed) {
  const p = list[0];
  const cedula = normalizeCedula(p.cedula) || cedKey.replace(/^n:/, '');
  const id = uid++;
  usuarios.push({
    id,
    nombre: p.nombre,
    cedula,
    telefono: p.telefono || null,
    celular: p.celular || null,
    celular_secundario: p.celular2 || null,
    email: p.email || null,
    direccion: p.direccion || null,
    ciudad: p.ciudad || null,
    fecha_vinculacion: parseDateEs(p.fechaAccidente) || new Date().toISOString().slice(0, 10),
    poderes_firmados: true,
    caso_entregado: true,
    tiene_vehiculo_involucrado: false
  });

  list.forEach((r, idx) => {
    const fechaAccidente = parseDateEs(r.fechaAccidente);
    const estado = String(r.estado || '').toLowerCase().includes('inactiv')
      ? 'finalizado'
      : 'activo';
    const blob = [r.actuacion, r.gestion, r.alcance, r.estadoProceso, r.estado]
      .filter(Boolean)
      .join(' ');
    const etapaActual = inferEtapaFromText(blob, estado);
    tramites.push({
      id: `t-m-${tid++}`,
      usuario_id: id,
      titulo: r.clase || r.aseguradora || `Caso ${r.nombre}`,
      caso_label: [r.aseguradora, fechaAccidente].filter(Boolean).join(' · ') || null,
      estado_general: estado,
      etapa_actual: etapaActual,
      es_caso_adicional: idx > 0,
      fecha_accidente: fechaAccidente,
      lugar_accidente: r.lugar || null,
      responsabilidad: r.responsabilidad || null,
      caducidad: parseDateEs(r.caducidad),
      aseguradora: r.aseguradora || null,
      radicado: r.radicado || null,
      fiscalia: r.fiscalia || null,
      juzgado: r.juzgado || null,
      alcance: r.alcance || null,
      gestion: r.gestion || null,
      observaciones_internas: [r.actuacion, r.estadoProceso].filter(Boolean).join(' · ') || null,
      fecha_ingreso: parseDateEs(r.fechaAccidente) || new Date().toISOString().slice(0, 10),
      origen_key: keyOf(r),
      _docs: {
        denuncia: r.denuncia || null,
        dictamen: r.dictamen || null,
        reclamacion: r.reclamacion || null,
        conciliacion: r.conciliacionDoc || null,
        demanda: r.demanda || null
      }
    });
  });
}

const etapaCounts = tramites.reduce((acc, t) => {
  acc[t.etapa_actual] = (acc[t.etapa_actual] || 0) + 1;
  return acc;
}, {});

const summary = {
  control: control.length,
  activos: activos.length,
  merged,
  soloActivos,
  usuarios: usuarios.length,
  tramites: tramites.length,
  etapas: etapaCounts
};

writeFileSync(
  OUT_JSON,
  JSON.stringify({ generatedAt: new Date().toISOString(), summary, usuarios, tramites }, null, 2)
);
console.log('Seed JSON escrito en', OUT_JSON);
console.log(summary);

/** Carga .env de la raíz (Node no lo hace solo). */
const loadEnvFile = () => {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] == null) process.env[k] = v;
  }
};

const pushSupabase = process.argv.includes('--supabase');
if (!pushSupabase) {
  console.log('Listo (solo JSON). Para subir a Supabase: npm run import:manizales:supabase');
  process.exit(0);
}

loadEnvFile();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o ANON) en .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const { error: uErr } = await supabase.from('usuarios').upsert(
  usuarios.map(({ id, ...rest }) => ({ id, ...rest })),
  { onConflict: 'cedula' }
);
if (uErr) {
  console.error('Error usuarios:', uErr);
  process.exit(1);
}

// Re-fetch ids by cedula for FK safety
const { data: dbUsers, error: fErr } = await supabase.from('usuarios').select('id, cedula');
if (fErr) {
  console.error(fErr);
  process.exit(1);
}
const idByCed = new Map((dbUsers || []).map((u) => [u.cedula, u.id]));

const tramitesPayload = tramites.map(({ _docs, ...t }) => ({
  ...t,
  usuario_id: idByCed.get(usuarios.find((u) => u.id === t.usuario_id)?.cedula) || t.usuario_id
}));

const { error: tErr } = await supabase.from('tramites').upsert(tramitesPayload, {
  onConflict: 'id'
});
if (tErr) {
  console.error('Error tramites:', tErr);
  process.exit(1);
}

// Etapas completas con progreso inferido + links Drive
const etapas = tramites.flatMap((t) => buildEtapasForTramite(t));

const { error: eErr } = await supabase.from('etapas').upsert(etapas, { onConflict: 'id' });
if (eErr) {
  console.error('Error etapas:', eErr);
  process.exit(1);
}

console.log('Import a Supabase OK:', summary);
