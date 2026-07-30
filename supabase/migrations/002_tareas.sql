-- Tareas operativas (sistema aparte de alcance / agenda_notas)
-- Aplicar en SQL Editor tras 001_usuarios_tramites.sql

create table if not exists public.tareas (
  id text primary key,
  titulo text not null,
  detalle text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_curso', 'hecha', 'bloqueada')),
  asignado_a text not null default 'por_asignar'
    check (asignado_a in ('giovanni', 'leidy', 'salome', 'por_asignar', 'cliente')),
  usuario_id bigint references public.usuarios (id) on delete set null,
  tramite_id text references public.tramites (id) on delete set null,
  fecha_limite date,
  prioridad text check (prioridad is null or prioridad in ('alta', 'media', 'baja')),
  origen text not null default 'manual' check (origen in ('excel', 'manual')),
  origen_key text,
  creado_por text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists tareas_asignado_a_idx on public.tareas (asignado_a);
create index if not exists tareas_estado_idx on public.tareas (estado);
create index if not exists tareas_usuario_id_idx on public.tareas (usuario_id);
create unique index if not exists tareas_origen_key_uidx
  on public.tareas (origen_key)
  where origen_key is not null;

alter table public.tareas enable row level security;

drop policy if exists "tareas_all_anon" on public.tareas;
create policy "tareas_all_anon" on public.tareas for all using (true) with check (true);
