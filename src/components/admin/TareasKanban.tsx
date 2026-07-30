import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, GripVertical, Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import { StaffId, staffLabel } from '../../data/staffCatalog';
import { Tarea } from '../../types/tarea';

export type KanbanColumnId = 'por_asignar' | 'pendiente' | 'en_curso' | 'hecha';

const COLUMNS: {
  id: KanbanColumnId;
  title: string;
  hint: string;
  accent: string;
}[] = [
  {
    id: 'por_asignar',
    title: 'Sin asignar',
    hint: 'Sin responsable del equipo',
    accent: 'border-amber-200 bg-amber-50/50'
  },
  {
    id: 'pendiente',
    title: 'Pendientes',
    hint: 'Asignadas, por empezar',
    accent: 'border-slate-200 bg-slate-50/80'
  },
  {
    id: 'en_curso',
    title: 'Trabajando',
    hint: 'En curso ahora',
    accent: 'border-sky-200 bg-sky-50/50'
  },
  {
    id: 'hecha',
    title: 'Terminadas',
    hint: 'Completadas',
    accent: 'border-emerald-200 bg-emerald-50/40'
  }
];

const columnOf = (t: Tarea): KanbanColumnId => {
  if (t.estado === 'hecha') return 'hecha';
  if (t.asignadoA === 'por_asignar') return 'por_asignar';
  if (t.estado === 'en_curso') return 'en_curso';
  return 'pendiente'; // pendiente | bloqueada con asignado
};

export const updatesForKanbanColumn = (
  column: KanbanColumnId,
  current: Tarea,
  fallbackAssignee: StaffId = 'giovanni'
): Partial<Tarea> => {
  switch (column) {
    case 'por_asignar':
      return { asignadoA: 'por_asignar', estado: 'pendiente' };
    case 'pendiente':
      return {
        estado: 'pendiente',
        asignadoA:
          current.asignadoA === 'por_asignar' ? fallbackAssignee : current.asignadoA
      };
    case 'en_curso':
      return {
        estado: 'en_curso',
        asignadoA:
          current.asignadoA === 'por_asignar' ? fallbackAssignee : current.asignadoA
      };
    case 'hecha':
      return { estado: 'hecha' };
    default:
      return {};
  }
};

interface TareasKanbanProps {
  tareas: Tarea[];
  userName: (id?: number) => string;
  fallbackAssignee: StaffId;
  onMove: (tareaId: string, updates: Partial<Tarea>) => void;
  onEdit: (t: Tarea) => void;
  onDelete: (t: Tarea) => void;
}

const TareasKanban = ({
  tareas,
  userName,
  fallbackAssignee,
  onMove,
  onEdit,
  onDelete
}: TareasKanbanProps) => {
  const navigate = useNavigate();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<KanbanColumnId | null>(null);

  const grouped = useMemo(() => {
    const map: Record<KanbanColumnId, Tarea[]> = {
      por_asignar: [],
      pendiente: [],
      en_curso: [],
      hecha: []
    };
    for (const t of tareas) {
      map[columnOf(t)].push(t);
    }
    return map;
  }, [tareas]);

  const moveTo = (t: Tarea, column: KanbanColumnId) => {
    if (columnOf(t) === column) return;
    onMove(t.id, updatesForKanbanColumn(column, t, fallbackAssignee));
  };

  return (
    <div className="flex w-full min-w-0 flex-nowrap gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const items = grouped[col.id];
        const isOver = overColumn === col.id;
        return (
          <section
            key={col.id}
            className={`flex min-h-[50vh] min-w-[240px] flex-1 basis-0 flex-col rounded-2xl border p-3 ${col.accent} ${
              isOver ? 'ring-2 ring-blue-400' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col.id);
            }}
            onDragLeave={() => setOverColumn((prev) => (prev === col.id ? null : prev))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/tarea-id') || draggingId;
              setOverColumn(null);
              setDraggingId(null);
              const t = tareas.find((x) => x.id === id);
              if (t) moveTo(t, col.id);
            }}
          >
            <header className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
                <p className="text-[11px] text-slate-500">{col.hint}</p>
              </div>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                {items.length}
              </span>
            </header>

            <ul className="flex min-h-[120px] flex-1 flex-col gap-2">
              {items.length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-200/80 bg-white/40 px-3 py-6 text-center text-xs text-slate-400">
                  Suelta aquí
                </li>
              ) : (
                items.map((t) => (
                  <li
                    key={t.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(t.id);
                      e.dataTransfer.setData('text/tarea-id', t.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverColumn(null);
                    }}
                    className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
                      draggingId === t.id ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {staffLabel(t.asignadoA)}
                          </span>
                          {t.origen === 'excel' && (
                            <span className="text-[10px] text-amber-700">Excel</span>
                          )}
                        </div>
                        <p
                          className={`mt-1 text-sm font-semibold text-slate-900 ${
                            t.estado === 'hecha' ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {t.titulo}
                        </p>
                        {t.detalle && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{t.detalle}</p>
                        )}
                        <p className="mt-1.5 text-[11px] text-slate-500">{userName(t.usuarioId)}</p>

                        <label className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Mover a
                          <select
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium normal-case text-slate-700"
                            value={col.id}
                            onChange={(e) => moveTo(t, e.target.value as KanbanColumnId)}
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {t.usuarioId != null && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="!px-2 !py-1 text-xs"
                              onClick={() => navigate(`/admin/usuarios/${t.usuarioId}`)}
                            >
                              Cliente
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="!px-2 !py-1 text-xs"
                            onClick={() => onEdit(t)}
                          >
                            <Pencil className="h-3 w-3 shrink-0" />
                            Editar
                          </Button>
                          {t.estado !== 'hecha' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="!px-2 !py-1 text-xs"
                              onClick={() => moveTo(t, 'hecha')}
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              Hecha
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="danger"
                            className="!px-2 !py-1 text-xs"
                            onClick={() => onDelete(t)}
                          >
                            <Trash2 className="h-3 w-3 shrink-0" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default TareasKanban;
