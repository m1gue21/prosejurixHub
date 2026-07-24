# Cutover Manizales → ProsejurixHub

Checklist para apagar Sheets y operar con mock local o Supabase.

## Ya hecho en código

- [x] SQL `supabase/migrations/001_usuarios_tramites.sql`
- [x] Merge CSV CONTROL + ACTIVOS (`src/lib/csvManizales.ts`)
- [x] Seed mock desde CSVs (`seedUsuariosTramites` + `SEED_VERSION` v8)
- [x] Script `scripts/import-manizales.mjs` (+ `--supabase`)
- [x] `dataProvider` (`VITE_DATA_SOURCE=mock|supabase`)
- [x] Hooks `useUsuarios` / `useAgenda` async
- [x] Portal login vía dataProvider
- [x] Campos alcance / gestión en ficha admin
- [x] Keep-alive GitHub Action

## Pendiente en tu proyecto Supabase / Vercel

- [ ] Ejecutar el SQL de migración en el dashboard
- [ ] `node scripts/import-manizales.mjs --supabase` con `.env` válido
- [ ] Secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` para el workflow keep-alive
- [ ] En producción: `VITE_DATA_SOURCE=supabase`
- [ ] Confirmar que el equipo deja de editar los tabs de Sheets
- [ ] (Opcional) Endurecer RLS antes de datos sensibles

## Validación rápida

1. `npm run dev` → `/admin/usuarios` muestra ~345 usuarios (mock CSV).
2. Abrir un usuario con ACTIVOS: ver alcance, gestión y links Drive en checklist.
3. Portal: login con un ID real del seed.
4. Tras import Supabase: cambiar `VITE_DATA_SOURCE=supabase` y repetir 1–3.
