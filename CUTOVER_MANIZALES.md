# Cutover Manizales → ProsejurixHub

Fuente de verdad de clientes/trámites: **hoja ACTIVOS** de `activos.xlsx` (`ACTIVOS_ONLY.csv`).  
No se importa CONTROL (generaba ruido).

## Ya hecho en código

- [x] SQL `supabase/migrations/001_usuarios_tramites.sql` + `002_tareas.sql`
- [x] Seed mock solo ACTIVOS (`seedUsuariosTramites` + `SEED_VERSION` activos-only)
- [x] Script `scripts/import-manizales.mjs` (lee `ACTIVOS_ONLY.csv`)
- [x] `npm run import:activos:supabase` (`--supabase --replace`)
- [x] Tareas Excel solo si el cliente está en ACTIVOS
- [x] `dataProvider` (`VITE_DATA_SOURCE=mock|supabase`)

## Operación

```bash
# Regenerar JSON + reemplazar Supabase (~100 usuarios / ~102 trámites)
npm run import:activos:supabase

# Relinkear tareas Excel a esos usuarios
npm run import:tareas:supabase
```

Mock local: al subir `SEED_VERSION`, se regenera el store (o borra localStorage del origen).

## Validación rápida

1. `npm run dev` → `/admin/usuarios` ~100 usuarios (no ~345).
2. Abrir un activo: alcance, gestión, etapas.
3. Agenda → Tareas: solo las que matchean clientes ACTIVOS.
