import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Plus,
  Trash2,
  Waypoints
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useAgenda } from '../../hooks/useAgenda';
import { useUsuarios } from '../../hooks/useUsuarios';
import {
  AgendaFilter,
  addDaysIso,
  countByDay,
  countToday,
  todayIso,
  weekDaysIso
} from '../../lib/agendaItems';
import { formatFechaEs } from '../../lib/caducidad';
import { AgendaItem, TipoAgendaNota } from '../../types/agenda';
import { useNotifications } from '../../components/common/NotificationProvider';
import { useConfirm } from '../../components/common/ConfirmProvider';

type ChipId = 'hoy' | 'manana' | 'semana' | 'mes' | 'urgentes';

interface LocationState {
  openCreate?: boolean;
  usuarioId?: number;
  tramiteId?: string;
}

const weekdayShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const tipoIcon = (tipo: AgendaItem['tipo']) => {
  switch (tipo) {
    case 'caducidad':
      return AlertTriangle;
    case 'etapa':
      return Waypoints;
    case 'comunicacion':
      return MessageSquare;
    case 'novedad':
      return Bell;
    default:
      return CalendarClock;
  }
};

const tipoLabel = (tipo: AgendaItem['tipo']) => {
  switch (tipo) {
    case 'caducidad':
      return 'Caducidad';
    case 'etapa':
      return 'Etapa';
    case 'comunicacion':
      return 'Comunicación';
    case 'novedad':
      return 'Novedad';
    default:
      return 'Recordatorio';
  }
};

const prioridadBadge = (p: AgendaItem['prioridad']) => {
  switch (p) {
    case 'critica':
      return 'bg-rose-600 text-white';
    case 'alta':
      return 'bg-orange-500 text-white';
    case 'media':
      return 'bg-amber-100 text-amber-900';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const emptyForm = (prefs?: { usuarioId?: number; tramiteId?: string; fecha?: string }) => ({
  tipo: 'recordatorio' as TipoAgendaNota,
  fecha: prefs?.fecha || todayIso(),
  titulo: '',
  detalle: '',
  usuarioId: prefs?.usuarioId ? String(prefs.usuarioId) : '',
  tramiteId: prefs?.tramiteId || '',
  creadoPor: ''
});

const Agenda = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const { notify } = useNotifications();
  const { confirm } = useConfirm();
  const { usuarios } = useUsuarios();

  const [chip, setChip] = useState<ChipId>('hoy');
  const [day, setDay] = useState(todayIso());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() =>
    emptyForm({ usuarioId: state.usuarioId, tramiteId: state.tramiteId })
  );

  const filter: AgendaFilter = useMemo(() => {
    if (chip === 'urgentes') return { mode: 'urgentes', day };
    if (chip === 'semana') return { mode: 'week', day };
    if (chip === 'mes') return { mode: 'month', day };
    return { mode: 'day', day };
  }, [chip, day]);

  const { allItems, items, createNota, updateNota, deleteNota, today } = useAgenda(filter);
  const week = useMemo(() => weekDaysIso(day), [day]);
  const dayCounts = useMemo(() => countByDay(allItems, week), [allItems, week]);
  const todayCount = useMemo(() => countToday(allItems), [allItems]);

  useEffect(() => {
    if (state.openCreate) {
      setForm(emptyForm({ usuarioId: state.usuarioId, tramiteId: state.tramiteId, fecha: day }));
      setEditingId(null);
      setShowForm(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [state.openCreate, state.usuarioId, state.tramiteId, day, navigate, location.pathname]);

  const applyChip = (id: ChipId) => {
    setChip(id);
    if (id === 'hoy') setDay(today);
    if (id === 'manana') setDay(addDaysIso(today, 1));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm({ fecha: chip === 'manana' ? addDaysIso(today, 1) : day }));
    setShowForm(true);
  };

  const openEdit = (item: AgendaItem) => {
    if (!item.notaId) return;
    setEditingId(item.notaId);
    setForm({
      tipo: item.tipo === 'novedad' ? 'novedad' : 'recordatorio',
      fecha: item.fecha,
      titulo: item.titulo,
      detalle: item.detalle || '',
      usuarioId: item.usuarioId != null ? String(item.usuarioId) : '',
      tramiteId: item.tramiteId || '',
      creadoPor: ''
    });
    setShowForm(true);
  };

  const submitForm = () => {
    if (!form.titulo.trim()) return;
    const payload = {
      tipo: form.tipo,
      fecha: form.fecha,
      titulo: form.titulo.trim(),
      detalle: form.detalle.trim() || undefined,
      usuarioId: form.usuarioId ? Number(form.usuarioId) : undefined,
      tramiteId: form.tramiteId || undefined,
      creadoPor: form.creadoPor.trim() || undefined
    };
    void (async () => {
      if (editingId) {
        await updateNota(editingId, payload);
        notify({ type: 'success', title: 'Actualizado', message: payload.titulo });
      } else {
        await createNota(payload);
        notify({ type: 'success', title: 'Registrado', message: payload.titulo });
      }
      setShowForm(false);
    })();
  };

  const tramitesForUser = useMemo(() => {
    const uid = form.usuarioId ? Number(form.usuarioId) : null;
    if (!uid) return [];
    return usuarios.find((u) => u.id === uid)?.tramites || [];
  }, [form.usuarioId, usuarios]);

  const subtitle =
    chip === 'urgentes'
      ? 'Caducidades vencidas y críticas'
      : chip === 'semana'
        ? `Semana del ${formatFechaEs(week[0])}`
        : chip === 'mes'
          ? `Mes de ${formatFechaEs(day).split(' de ')[1] || day.slice(0, 7)}`
          : formatFechaEs(day);

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 safe-px py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => navigate('/admin/usuarios')}
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Usuarios</span>
            </Button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 sm:text-xs">
                Centro operativo
              </p>
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                Agenda y novedades
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                {todayCount} pendientes hoy · {subtitle}
              </p>
            </div>
          </div>
          <Button size="sm" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva novedad / recordatorio
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 safe-px py-4 sm:space-y-5 sm:px-6 sm:py-6">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {(
            [
              ['hoy', 'Hoy'],
              ['manana', 'Mañana'],
              ['semana', 'Esta semana'],
              ['mes', 'Este mes'],
              ['urgentes', 'Urgentes']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyChip(id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                chip === id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
          <label className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200">
            <span className="text-slate-500">Día</span>
            <input
              type="date"
              className="bg-transparent text-slate-800 outline-none"
              value={day}
              onChange={(e) => {
                setDay(e.target.value || today);
                setChip('hoy');
              }}
            />
          </label>
        </div>

        {chip !== 'urgentes' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Semana
            </p>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {week.map((d, idx) => {
                const selected = d === day && (chip === 'hoy' || chip === 'manana' || filter.mode === 'day');
                const count = dayCounts[d] || 0;
                const isToday = d === today;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDay(d);
                      setChip(d === today ? 'hoy' : d === addDaysIso(today, 1) ? 'manana' : 'hoy');
                    }}
                    className={`rounded-xl px-1 py-2 text-center transition sm:rounded-2xl sm:px-2 sm:py-3 ${
                      selected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isToday
                          ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-200'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-[10px] font-medium uppercase opacity-80 sm:text-xs">
                      {weekdayShort[idx]}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold sm:text-base">
                      {Number(d.slice(8, 10))}
                    </span>
                    {count > 0 && (
                      <span
                        className={`mt-1 inline-flex min-w-[1.25rem] justify-center rounded-full px-1 text-[10px] font-semibold ${
                          selected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Sin ítems en este filtro</p>
            <p className="mt-1 text-xs text-slate-500">
              Cambia el día o crea un recordatorio / novedad.
            </p>
            <Button className="mt-4" size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Crear
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const Icon = tipoIcon(item.tipo);
              return (
                <li
                  key={item.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm ${
                    item.hecho ? 'border-slate-100 opacity-70' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {tipoLabel(item.tipo)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${prioridadBadge(item.prioridad)}`}
                          >
                            {item.prioridad}
                          </span>
                          <span className="text-xs text-slate-500">{formatFechaEs(item.fecha)}</span>
                        </div>
                        <p
                          className={`mt-1 font-semibold text-slate-900 ${
                            item.hecho ? 'line-through' : ''
                          }`}
                        >
                          {item.titulo}
                        </p>
                        {item.detalle && (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.detalle}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">
                          {item.usuarioNombre ||
                            (item.usuarioId != null ? `Usuario #${item.usuarioId}` : 'Sin usuario')}
                          {item.tramiteTitulo ? ` · ${item.tramiteTitulo}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {item.usuarioId != null && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/usuarios/${item.usuarioId}`)}
                        >
                          Abrir
                        </Button>
                      )}
                      {item.editable && item.notaId && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              updateNota(item.notaId!, { hecho: !item.hecho });
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            {item.hecho ? 'Reabrir' : 'Hecho'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={async () => {
                              const ok = await confirm({
                                title: 'Eliminar',
                                message: `¿Eliminar “${item.titulo}”?`,
                                confirmText: 'Eliminar'
                              });
                              if (!ok) return;
                              deleteNota(item.notaId!);
                              notify({
                                type: 'success',
                                title: 'Eliminado',
                                message: item.titulo
                              });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Editar nota' : 'Nueva novedad / recordatorio'}
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Tipo</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tipo: e.target.value as TipoAgendaNota }))
                }
              >
                <option value="recordatorio">Recordatorio</option>
                <option value="novedad">Novedad</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Fecha</span>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Título</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej. Llamar al cliente"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Detalle</span>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.detalle}
              onChange={(e) => setForm((f) => ({ ...f, detalle: e.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Usuario (opcional)</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.usuarioId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usuarioId: e.target.value, tramiteId: '' }))
                }
              >
                <option value="">Sin asociar</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    #{u.id} · {u.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Trámite</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.tramiteId}
                disabled={!form.usuarioId}
                onChange={(e) => setForm((f) => ({ ...f, tramiteId: e.target.value }))}
              >
                <option value="">Sin asociar</option>
                {tramitesForUser.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Creado por</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.creadoPor}
              onChange={(e) => setForm((f) => ({ ...f, creadoPor: e.target.value }))}
              placeholder="Nombre o área"
            />
          </label>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={!form.titulo.trim()}
              onClick={submitForm}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Agenda;
