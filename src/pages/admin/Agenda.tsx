import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Columns3,
  List,
  MessageSquare,
  Plus,
  Trash2,
  Waypoints
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import TareasKanban from '../../components/admin/TareasKanban';
import { useAgenda } from '../../hooks/useAgenda';
import { useTareas } from '../../hooks/useTareas';
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
import { getStaffSession } from '../../lib/staffSession';
import { STAFF_PROFILES, staffLabel } from '../../data/staffCatalog';
import { AgendaItem, TipoAgendaNota } from '../../types/agenda';
import { Tarea, TareaAsignado, TareaEstado } from '../../types/tarea';
import { useNotifications } from '../../components/common/NotificationProvider';
import { useConfirm } from '../../components/common/ConfirmProvider';

type AgendaTab = 'novedades' | 'recordatorios' | 'tareas';
type ChipId = 'hoy' | 'manana' | 'semana' | 'mes' | 'urgentes';
type AsignadoFilter = 'todas' | TareaAsignado;
type TareasVista = 'lista' | 'tabla';

interface LocationState {
  openCreate?: boolean;
  usuarioId?: number;
  tramiteId?: string;
  tab?: AgendaTab;
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

const isNovedadItem = (item: AgendaItem) =>
  item.tipo === 'comunicacion' || item.tipo === 'novedad';

const isRecordatorioItem = (item: AgendaItem) =>
  item.tipo === 'caducidad' || item.tipo === 'etapa' || item.tipo === 'recordatorio';

const emptyNotaForm = (prefs?: { usuarioId?: number; tramiteId?: string; fecha?: string }) => ({
  tipo: 'recordatorio' as TipoAgendaNota,
  fecha: prefs?.fecha || todayIso(),
  titulo: '',
  detalle: '',
  usuarioId: prefs?.usuarioId ? String(prefs.usuarioId) : '',
  tramiteId: prefs?.tramiteId || ''
});

const emptyTareaForm = (prefs?: { usuarioId?: number; tramiteId?: string }) => ({
  titulo: '',
  detalle: '',
  asignadoA: 'por_asignar' as TareaAsignado,
  estado: 'pendiente' as TareaEstado,
  usuarioId: prefs?.usuarioId ? String(prefs.usuarioId) : '',
  tramiteId: prefs?.tramiteId || '',
  fechaLimite: ''
});

const Agenda = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const { notify } = useNotifications();
  const { confirm } = useConfirm();
  const { usuarios } = useUsuarios();
  const session = getStaffSession();

  const [tab, setTab] = useState<AgendaTab>(state.tab || 'tareas');
  const [chip, setChip] = useState<ChipId>('hoy');
  const [day, setDay] = useState(todayIso());
  const [asignadoFilter, setAsignadoFilter] = useState<AsignadoFilter>('todas');
  const [tareaSearch, setTareaSearch] = useState('');
  const [tareasVista, setTareasVista] = useState<TareasVista>('lista');
  const [showNotaForm, setShowNotaForm] = useState(false);
  const [showTareaForm, setShowTareaForm] = useState(false);
  const [editingNotaId, setEditingNotaId] = useState<string | null>(null);
  const [editingTareaId, setEditingTareaId] = useState<string | null>(null);
  const [notaForm, setNotaForm] = useState(() =>
    emptyNotaForm({ usuarioId: state.usuarioId, tramiteId: state.tramiteId })
  );
  const [tareaForm, setTareaForm] = useState(() =>
    emptyTareaForm({ usuarioId: state.usuarioId, tramiteId: state.tramiteId })
  );

  const filter: AgendaFilter = useMemo(() => {
    if (chip === 'urgentes') return { mode: 'urgentes', day };
    if (chip === 'semana') return { mode: 'week', day };
    if (chip === 'mes') return { mode: 'month', day };
    return { mode: 'day', day };
  }, [chip, day]);

  const { allItems, items, createNota, updateNota, deleteNota, today } = useAgenda(filter);
  const { tareas, createTarea, updateTarea, deleteTarea } = useTareas();

  const week = useMemo(() => weekDaysIso(day), [day]);
  const dayCounts = useMemo(() => countByDay(allItems, week), [allItems, week]);
  const todayCount = useMemo(() => countToday(allItems), [allItems]);

  const novedades = useMemo(() => items.filter(isNovedadItem), [items]);
  const recordatorios = useMemo(() => items.filter(isRecordatorioItem), [items]);

  const tareasFiltradas = useMemo(() => {
    let list = [...tareas];
    if (asignadoFilter !== 'todas') {
      list = list.filter((t) => t.asignadoA === asignadoFilter);
    }
    const q = tareaSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const cliente =
          t.usuarioId != null
            ? usuarios.find((u) => u.id === t.usuarioId)?.nombre || ''
            : '';
        const haystack = [
          t.titulo,
          t.detalle,
          t.estado,
          staffLabel(t.asignadoA),
          cliente,
          t.usuarioId != null ? String(t.usuarioId) : ''
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return list;
  }, [tareas, asignadoFilter, tareaSearch, usuarios]);

  const tareaCounts = useMemo(() => {
    const c = {
      todas: tareas.filter((t) => t.estado !== 'hecha').length,
      por_asignar: 0,
      giovanni: 0,
      leidy: 0,
      salome: 0,
      cliente: 0
    };
    for (const t of tareas) {
      if (t.estado === 'hecha') continue;
      if (t.asignadoA in c) c[t.asignadoA as keyof typeof c] += 1;
    }
    return c;
  }, [tareas]);

  useEffect(() => {
    if (state.openCreate) {
      if (state.tab === 'tareas' || tab === 'tareas') {
        setTab('tareas');
        setTareaForm(emptyTareaForm({ usuarioId: state.usuarioId, tramiteId: state.tramiteId }));
        setEditingTareaId(null);
        setShowTareaForm(true);
      } else {
        setTab(state.tab === 'novedades' ? 'novedades' : 'recordatorios');
        setNotaForm(
          emptyNotaForm({
            usuarioId: state.usuarioId,
            tramiteId: state.tramiteId,
            fecha: day
          })
        );
        setNotaForm((f) => ({
          ...f,
          tipo: state.tab === 'novedades' ? 'novedad' : 'recordatorio'
        }));
        setEditingNotaId(null);
        setShowNotaForm(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [state.openCreate, state.usuarioId, state.tramiteId, state.tab, day, navigate, location.pathname, tab]);

  const applyChip = (id: ChipId) => {
    setChip(id);
    if (id === 'hoy') setDay(today);
    if (id === 'manana') setDay(addDaysIso(today, 1));
  };

  const openCreate = () => {
    if (tab === 'tareas') {
      setEditingTareaId(null);
      setTareaForm(emptyTareaForm());
      setShowTareaForm(true);
      return;
    }
    setEditingNotaId(null);
    setNotaForm({
      ...emptyNotaForm({ fecha: chip === 'manana' ? addDaysIso(today, 1) : day }),
      tipo: tab === 'novedades' ? 'novedad' : 'recordatorio'
    });
    setShowNotaForm(true);
  };

  const openEditNota = (item: AgendaItem) => {
    if (!item.notaId) return;
    setEditingNotaId(item.notaId);
    setNotaForm({
      tipo: item.tipo === 'novedad' ? 'novedad' : 'recordatorio',
      fecha: item.fecha,
      titulo: item.titulo,
      detalle: item.detalle || '',
      usuarioId: item.usuarioId != null ? String(item.usuarioId) : '',
      tramiteId: item.tramiteId || ''
    });
    setShowNotaForm(true);
  };

  const openEditTarea = (t: Tarea) => {
    setEditingTareaId(t.id);
    setTareaForm({
      titulo: t.titulo,
      detalle: t.detalle || '',
      asignadoA: t.asignadoA,
      estado: t.estado,
      usuarioId: t.usuarioId != null ? String(t.usuarioId) : '',
      tramiteId: t.tramiteId || '',
      fechaLimite: t.fechaLimite || ''
    });
    setShowTareaForm(true);
  };

  const submitNota = () => {
    if (!notaForm.titulo.trim()) return;
    const payload = {
      tipo: notaForm.tipo,
      fecha: notaForm.fecha,
      titulo: notaForm.titulo.trim(),
      detalle: notaForm.detalle.trim() || undefined,
      usuarioId: notaForm.usuarioId ? Number(notaForm.usuarioId) : undefined,
      tramiteId: notaForm.tramiteId || undefined,
      creadoPor: session?.nombre
    };
    void (async () => {
      if (editingNotaId) {
        await updateNota(editingNotaId, payload);
        notify({ type: 'success', title: 'Actualizado', message: payload.titulo });
      } else {
        await createNota(payload);
        notify({ type: 'success', title: 'Registrado', message: payload.titulo });
      }
      setShowNotaForm(false);
    })();
  };

  const submitTarea = () => {
    if (!tareaForm.titulo.trim()) return;
    const payload = {
      titulo: tareaForm.titulo.trim(),
      detalle: tareaForm.detalle.trim() || undefined,
      asignadoA: tareaForm.asignadoA,
      estado: tareaForm.estado,
      usuarioId: tareaForm.usuarioId ? Number(tareaForm.usuarioId) : undefined,
      tramiteId: tareaForm.tramiteId || undefined,
      fechaLimite: tareaForm.fechaLimite || undefined,
      creadoPor: session?.nombre
    };
    void (async () => {
      if (editingTareaId) {
        await updateTarea(editingTareaId, payload);
        notify({ type: 'success', title: 'Tarea actualizada', message: payload.titulo });
      } else {
        await createTarea(payload);
        notify({ type: 'success', title: 'Tarea creada', message: payload.titulo });
      }
      setShowTareaForm(false);
    })();
  };

  const tramitesForNota = useMemo(() => {
    const uid = notaForm.usuarioId ? Number(notaForm.usuarioId) : null;
    if (!uid) return [];
    return usuarios.find((u) => u.id === uid)?.tramites || [];
  }, [notaForm.usuarioId, usuarios]);

  const tramitesForTarea = useMemo(() => {
    const uid = tareaForm.usuarioId ? Number(tareaForm.usuarioId) : null;
    if (!uid) return [];
    return usuarios.find((u) => u.id === uid)?.tramites || [];
  }, [tareaForm.usuarioId, usuarios]);

  const userName = (id?: number) =>
    id != null ? usuarios.find((u) => u.id === id)?.nombre || `Usuario #${id}` : 'Sin cliente';

  const listForTab =
    tab === 'novedades' ? novedades : tab === 'recordatorios' ? recordatorios : null;

  const createLabel =
    tab === 'tareas' ? 'Nueva tarea' : tab === 'novedades' ? 'Nueva novedad' : 'Nuevo recordatorio';

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
                {session ? ` · ${session.nombre}` : ''}
              </p>
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">Agenda</h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                {tareaCounts.todas} tareas abiertas · {todayCount} avisos hoy
              </p>
            </div>
          </div>
          <Button size="sm" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="h-4 w-4 shrink-0" />
            {createLabel}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 safe-px py-4 sm:space-y-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['tareas', 'Tareas', ClipboardList, tareaCounts.todas],
              ['recordatorios', 'Recordatorios', CalendarClock, recordatorios.length],
              ['novedades', 'Novedades', Bell, novedades.length]
            ] as const
          ).map(([id, label, Icon, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-2xl px-2 py-3 text-center transition sm:px-3 ${
                tab === id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="mx-auto h-4 w-4 opacity-80" />
              <span className="mt-1 block text-xs font-semibold sm:text-sm">{label}</span>
              <span className="text-[11px] opacity-80">{count}</span>
            </button>
          ))}
        </div>

        {tab !== 'tareas' && (
          <>
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {chip !== 'urgentes' && (
              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Semana
                </p>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {week.map((d, idx) => {
                    const selected = d === day;
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
                        <span className="block text-[10px] font-medium uppercase opacity-80">
                          {weekdayShort[idx]}
                        </span>
                        <span className="mt-0.5 block text-sm font-bold">
                          {Number(d.slice(8, 10))}
                        </span>
                        {count > 0 && (
                          <span className="mt-1 inline-flex min-w-[1.25rem] justify-center rounded-full bg-black/10 px-1 text-[10px] font-semibold">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {tab === 'tareas' && (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchBar
                value={tareaSearch}
                onChange={setTareaSearch}
                placeholder="Buscar por tarea, cliente o asignado..."
                className="max-w-none flex-1"
              />
              <div className="inline-flex shrink-0 rounded-xl bg-white p-1 ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={() => setTareasVista('lista')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    tareasVista === 'lista'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <List className="h-4 w-4 shrink-0" />
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setTareasVista('tabla')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    tareasVista === 'tabla'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Columns3 className="h-4 w-4 shrink-0" />
                  Tabla
                </button>
              </div>
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {(
                [
                  ['todas', 'Todas', tareaCounts.todas],
                  ['por_asignar', 'Por asignar', tareaCounts.por_asignar],
                  ['giovanni', 'Giovanni', tareaCounts.giovanni],
                  ['leidy', 'Leidy', tareaCounts.leidy],
                  ['salome', 'Salomé', tareaCounts.salome],
                  ['cliente', 'Cliente', tareaCounts.cliente]
                ] as const
              ).map(([id, label, count]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAsignadoFilter(id)}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition ${
                    asignadoFilter === id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200'
                  }`}
                >
                  {label}
                  {count > 0 ? ` (${count})` : ''}
                </button>
              ))}
            </div>
            {tareaSearch.trim() && (
              <p className="text-xs text-slate-500">
                {tareasFiltradas.length} resultado
                {tareasFiltradas.length === 1 ? '' : 's'} para “{tareaSearch.trim()}”
              </p>
            )}
          </div>
        )}

        {tab === 'tareas' ? (
          tareasFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">Sin tareas en este filtro</p>
              <Button className="mt-4" size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 shrink-0" />
                Crear tarea
              </Button>
            </div>
          ) : tareasVista === 'tabla' ? (
            <TareasKanban
              tareas={tareasFiltradas}
              userName={userName}
              fallbackAssignee={session?.staffId || 'giovanni'}
              onMove={(id, updates) => {
                void updateTarea(id, updates).then(() => {
                  notify({ type: 'success', title: 'Tarea movida', message: 'Columna actualizada' });
                });
              }}
              onEdit={openEditTarea}
              onDelete={(t) => {
                void (async () => {
                  const ok = await confirm({
                    title: 'Eliminar tarea',
                    message: `¿Eliminar “${t.titulo}”?`,
                    confirmText: 'Eliminar'
                  });
                  if (!ok) return;
                  await deleteTarea(t.id);
                })();
              }}
            />
          ) : (
            <ul className="space-y-3">
              {tareasFiltradas.map((t) => (
                <li
                  key={t.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm ${
                    t.estado === 'hecha' ? 'border-slate-100 opacity-70' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                          {staffLabel(t.asignadoA)}
                        </span>
                        <span className="text-[11px] font-medium uppercase text-slate-400">
                          {t.estado}
                        </span>
                        {t.origen === 'excel' && (
                          <span className="text-[10px] text-amber-700">Excel</span>
                        )}
                      </div>
                      <p
                        className={`mt-1 font-semibold text-slate-900 ${
                          t.estado === 'hecha' ? 'line-through' : ''
                        }`}
                      >
                        {t.titulo}
                      </p>
                      {t.detalle && (
                        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{t.detalle}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">{userName(t.usuarioId)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {t.usuarioId != null && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/usuarios/${t.usuarioId}`)}
                        >
                          Cliente
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEditTarea(t)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void updateTarea(t.id, {
                            estado: t.estado === 'hecha' ? 'pendiente' : 'hecha'
                          })
                        }
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        {t.estado === 'hecha' ? 'Reabrir' : 'Hecha'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Eliminar tarea',
                            message: `¿Eliminar “${t.titulo}”?`,
                            confirmText: 'Eliminar'
                          });
                          if (!ok) return;
                          await deleteTarea(t.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : listForTab && listForTab.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Sin ítems en este filtro</p>
            <Button className="mt-4" size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 shrink-0" />
              Crear
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {(listForTab || []).map((item) => {
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
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {tipoLabel(item.tipo)}
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
                          <Button size="sm" variant="outline" onClick={() => openEditNota(item)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void updateNota(item.notaId!, { hecho: !item.hecho })}
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
                              await deleteNota(item.notaId!);
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
        isOpen={showNotaForm}
        onClose={() => setShowNotaForm(false)}
        title={editingNotaId ? 'Editar' : 'Nueva nota'}
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Tipo</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={notaForm.tipo}
                onChange={(e) =>
                  setNotaForm((f) => ({ ...f, tipo: e.target.value as TipoAgendaNota }))
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
                value={notaForm.fecha}
                onChange={(e) => setNotaForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Título</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={notaForm.titulo}
              onChange={(e) => setNotaForm((f) => ({ ...f, titulo: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Detalle</span>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={notaForm.detalle}
              onChange={(e) => setNotaForm((f) => ({ ...f, detalle: e.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Cliente</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={notaForm.usuarioId}
                onChange={(e) =>
                  setNotaForm((f) => ({ ...f, usuarioId: e.target.value, tramiteId: '' }))
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
                value={notaForm.tramiteId}
                disabled={!notaForm.usuarioId}
                onChange={(e) => setNotaForm((f) => ({ ...f, tramiteId: e.target.value }))}
              >
                <option value="">Sin asociar</option>
                {tramitesForNota.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowNotaForm(false)}>
              Cancelar
            </Button>
            <Button disabled={!notaForm.titulo.trim()} onClick={submitNota}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showTareaForm}
        onClose={() => setShowTareaForm(false)}
        title={editingTareaId ? 'Editar tarea' : 'Nueva tarea'}
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Título</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={tareaForm.titulo}
              onChange={(e) => setTareaForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Qué hay que hacer"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Detalle</span>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={tareaForm.detalle}
              onChange={(e) => setTareaForm((f) => ({ ...f, detalle: e.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Asignado a</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={tareaForm.asignadoA}
                onChange={(e) =>
                  setTareaForm((f) => ({ ...f, asignadoA: e.target.value as TareaAsignado }))
                }
              >
                <option value="por_asignar">Por asignar</option>
                {STAFF_PROFILES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
                <option value="cliente">Cliente</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Estado</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={tareaForm.estado}
                onChange={(e) =>
                  setTareaForm((f) => ({ ...f, estado: e.target.value as TareaEstado }))
                }
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
                <option value="hecha">Hecha</option>
                <option value="bloqueada">Bloqueada</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Cliente</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={tareaForm.usuarioId}
                onChange={(e) =>
                  setTareaForm((f) => ({ ...f, usuarioId: e.target.value, tramiteId: '' }))
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
              <span className="mb-1 block font-medium">Fecha límite</span>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={tareaForm.fechaLimite}
                onChange={(e) => setTareaForm((f) => ({ ...f, fechaLimite: e.target.value }))}
              />
            </label>
          </div>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Trámite</span>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={tareaForm.tramiteId}
              disabled={!tareaForm.usuarioId}
              onChange={(e) => setTareaForm((f) => ({ ...f, tramiteId: e.target.value }))}
            >
              <option value="">Sin asociar</option>
              {tramitesForTarea.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titulo}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowTareaForm(false)}>
              Cancelar
            </Button>
            <Button disabled={!tareaForm.titulo.trim()} onClick={submitTarea}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Agenda;
