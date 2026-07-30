/**
 * Aplica un SQL de migración vía conexión Postgres de Supabase.
 *
 * Uso:
 *   SUPABASE_DB_PASSWORD='tu_password' node scripts/apply-sql.mjs supabase/migrations/002_tareas.sql
 *
 * El password está en: Supabase → Project Settings → Database → Database password
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

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

loadEnvFile();

const sqlFile = process.argv[2] || 'supabase/migrations/002_tareas.sql';
const sqlPath = resolve(root, sqlFile);
if (!existsSync(sqlPath)) {
  console.error('No existe', sqlPath);
  process.exit(1);
}

const url = process.env.VITE_SUPABASE_URL || '';
const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_PASSWORD;

if (!ref) {
  console.error('Falta VITE_SUPABASE_URL válida en .env');
  process.exit(1);
}
if (!password) {
  console.error(`
No hay SUPABASE_DB_PASSWORD en el entorno ni en .env.

Opción A (recomendada, 30s):
  1. Abre Supabase → SQL Editor
  2. Pega el contenido de ${sqlFile}
  3. Run
  4. Luego: npm run import:tareas:supabase

Opción B (terminal):
  1. Project Settings → Database → copia el Database password
  2. Añade a .env: SUPABASE_DB_PASSWORD=tu_password
  3. npm run db:apply:tareas
`);
  process.exit(1);
}

const encoded = encodeURIComponent(password);
// Session mode pooler (IPv4-friendly)
const conn = `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

console.log('Aplicando', sqlFile, 'en proyecto', ref);
const result = spawnSync('psql', [conn, '-v', 'ON_ERROR_STOP=1', '-f', sqlPath], {
  encoding: 'utf8'
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) {
  // Fallback direct host
  const direct = `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`;
  console.log('Reintentando con host directo db.*.supabase.co …');
  const r2 = spawnSync('psql', [direct, '-v', 'ON_ERROR_STOP=1', '-f', sqlPath], {
    encoding: 'utf8'
  });
  if (r2.stdout) process.stdout.write(r2.stdout);
  if (r2.stderr) process.stderr.write(r2.stderr);
  if (r2.status !== 0) {
    console.error('Falló psql. Usa el SQL Editor del dashboard (Opción A).');
    process.exit(r2.status || 1);
  }
}
console.log('SQL aplicado OK');
