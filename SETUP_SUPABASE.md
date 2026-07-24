# Configuración de Supabase — ProsejurixHub

## Modelo de datos actual (usuarios / trámites)

Ya **no** se usa `CTRANTECEDENTES` como fuente principal del admin.
El esquema nuevo está en `supabase/migrations/001_usuarios_tramites.sql`:

- `usuarios`, `tramites` (incl. `alcance`, `gestion`, `origen_key`)
- `etapas` (checklist JSONB con links Drive)
- `comunicaciones`, `agenda_notas`, `profiles`
- RPC `keepalive_ping()` para el plan Free

## Variables de entorno (`.env`)

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# mock (default) | supabase
# mock = seed desde CSVs Manizales en localStorage
# supabase = lee/escribe tablas nuevas
VITE_DATA_SOURCE=mock
```

Reinicia `npm run dev` tras cambiar el `.env`.

## Cutover desde Google Sheets

1. En el SQL Editor de Supabase, ejecuta `supabase/migrations/001_usuarios_tramites.sql`.
2. Importa los CSV actualizados:

   ```bash
   # Solo genera JSON local (sin red)
   node scripts/import-manizales.mjs

   # Inserta en Supabase (usa VITE_SUPABASE_URL + anon o service role)
   node scripts/import-manizales.mjs --supabase
   ```

   Fuentes oficiales:

   - `actualizadoPROCESOS MANIZALES.xlsx - CONTROL PROCESOS ACCIDENTES(1).csv`
   - `actualizadoPROCESOS MANIZALES.xlsx - ACTIVOS(1).csv`

3. En Vercel / `.env`: `VITE_DATA_SOURCE=supabase`.
4. Deja de editar Sheets como fuente de verdad.
5. Configura keep-alive (abajo) para no pausar el Free.

## Keep-alive (plan Free)

Supabase Free pausa el proyecto ~7 días sin tráfico.

- Workflow: `.github/workflows/supabase-keepalive.yml` (cada 3 h).
- Secrets del repo: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Alternativa: Vercel Cron que haga `POST /rest/v1/rpc/keepalive_ping`.

## Límites Free y cuándo pasar a Pro (~$25/mes)

Quedarse en Free mientras:

- El equipo aguante posible pausa si falla el cron
- No se necesite Storage (usamos Drive vía `urlExterna`)
- No se necesite Realtime

Pasar a Pro cuando:

- Operación diaria no pueda arriesgar pausa
- Hagan falta backups/point-in-time o más cuota
- Auth/RLS endurecido para producción real con varios usuarios

## Auth / RLS

Hoy las políticas permiten `anon` all (piloto Free). Antes de datos sensibles en producción:

1. Auth de admin (`profiles.role = 'admin'`)
2. Políticas solo para `authenticated` admin
3. Portal cliente: solo lectura de su `usuario_id`

## Legacy

`useProcesses` / `CTRANTECEDENTES` pueden seguir existiendo; no invertir más ahí.
El admin y el portal de trámites usan `dataProvider` → mock o `usuariosRepo`.
