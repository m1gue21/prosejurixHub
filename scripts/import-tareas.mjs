/**
 * Importa TAREAS_PENDIENTES.csv → JSON local y opcionalmente Supabase.
 *
 *   npm run import:tareas
 *   npm run import:tareas:supabase
 *
 * Requiere antes: SQL 002_tareas.sql y usuarios ya importados (para match por nombre).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const CSV = resolve(root, 'TAREAS_PENDIENTES.csv');
const OUT = resolve(root, 'src/data/generatedTareasSeed.json');

const normalizePersonName = (raw) =>
  String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const inferAsignado = (blobRaw) => {
  const blob = String(blobRaw || '');
  const hits = [];
  if (/\bgiovanni\b/i.test(blob) || /\bdon\s+giovanni\b/i.test(blob)) hits.push('giovanni');
  if (/\bleidy\b/i.test(blob)) hits.push('leidy');
  if (/\bsalom[eé]\b/i.test(blob)) hits.push('salome');
  return hits.length === 1 ? hits[0] : 'por_asignar';
};

const shortTitulo = (detalle, max = 72) => {
  const clean = detalle.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
};

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
    if (row.some((c) => String(c).trim())) rows.push(row);
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

if (!existsSync(CSV)) {
  console.error('Falta TAREAS_PENDIENTES.csv en la raíz');
  process.exit(1);
}

const rows = parseCsv(readFileSync(CSV, 'utf8')).slice(1);
const ahora = new Date().toISOString();
const tareas = [];
let n = 1;

for (const cols of rows) {
  const nombre = (cols[0] || '').trim();
  const responsabilidad = (cols[1] || '').trim();
  const aseguradora = (cols[3] || '').trim();
  const alcance = (cols[4] || '').trim();
  if (!nombre || !alcance) continue;
  const asignadoA = inferAsignado(alcance);
  const origenKey = `excel|${normalizePersonName(nombre)}|${normalizePersonName(alcance).slice(0, 80)}`;
  tareas.push({
    id: `task-excel-${n++}`,
    titulo: shortTitulo(alcance),
    detalle: [alcance, responsabilidad && `Resp: ${responsabilidad}`, aseguradora && `Aseg: ${aseguradora}`]
      .filter(Boolean)
      .join(' · '),
    estado: 'pendiente',
    asignado_a: asignadoA,
    nombre_cliente: nombre,
    nombre_norm: normalizePersonName(nombre),
    origen: 'excel',
    origen_key: origenKey,
    creado_por: 'import-excel',
    creado_en: ahora,
    actualizado_en: ahora
  });
}

const byAsig = tareas.reduce((acc, t) => {
  acc[t.asignado_a] = (acc[t.asignado_a] || 0) + 1;
  return acc;
}, {});

writeFileSync(
  OUT,
  JSON.stringify(
    { generatedAt: ahora, summary: { total: tareas.length, byAsig }, tareas },
    null,
    2
  )
);
console.log('JSON escrito', OUT);
console.log({ total: tareas.length, byAsig });

if (!process.argv.includes('--supabase')) {
  console.log('Listo. Para Supabase: npm run import:tareas:supabase');
  process.exit(0);
}

loadEnvFile();
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Faltan credenciales Supabase en .env');
  process.exit(1);
}

const supabase = createClient(url, key);
const { data: users, error: uErr } = await supabase.from('usuarios').select('id, nombre');
if (uErr) {
  console.error(uErr);
  process.exit(1);
}

const { data: tramitesDb, error: tErr } = await supabase
  .from('tramites')
  .select('id, usuario_id, es_caso_adicional');
if (tErr) {
  console.error(tErr);
  process.exit(1);
}

const byName = new Map();
for (const u of users || []) {
  const keyN = normalizePersonName(u.nombre);
  if (!byName.has(keyN)) byName.set(keyN, u.id);
}

/** Trámite principal por usuario (no adicional; si no hay, el primero) */
const principalByUser = new Map();
for (const tr of tramitesDb || []) {
  const uid = Number(tr.usuario_id);
  if (!principalByUser.has(uid)) principalByUser.set(uid, tr.id);
}
for (const tr of tramitesDb || []) {
  if (!tr.es_caso_adicional) principalByUser.set(Number(tr.usuario_id), tr.id);
}

let matched = 0;
let skipped = 0;
const payload = [];
for (const t of tareas) {
  const usuarioId = byName.get(t.nombre_norm);
  if (!usuarioId) {
    skipped++;
    continue; // solo clientes presentes en ACTIVOS / usuarios actuales
  }
  matched++;
  payload.push({
    id: t.id,
    titulo: t.titulo,
    detalle: t.detalle,
    estado: t.estado,
    asignado_a: t.asignado_a,
    usuario_id: usuarioId,
    tramite_id: principalByUser.get(usuarioId) || null,
    origen: t.origen,
    origen_key: t.origen_key,
    creado_por: t.creado_por,
    creado_en: t.creado_en,
    actualizado_en: t.actualizado_en
  });
}

const { error } = await supabase.from('tareas').upsert(payload, { onConflict: 'id' });
if (error) {
  console.error('Error upsert tareas:', error);
  process.exit(1);
}
console.log('Import Supabase OK', {
  totalCsv: tareas.length,
  imported: payload.length,
  matched,
  skippedNoActivo: skipped
});
