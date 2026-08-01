import { ClipboardList, ExternalLink } from 'lucide-react';
import Button from '../common/Button';
import { staffLabel } from '../../data/staffCatalog';
import { Tarea, TareaEstado } from '../../types/tarea';

const ESTADO_LABEL: Record<TareaEstado, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  hecha: 'Hecha',
  bloqueada: 'Bloqueada'
};

const ESTADO_STYLE: Record<TareaEstado, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  en_curso: 'bg-sky-100 text-sky-800',
  hecha: 'bg-emerald-100 text-emerald-800',
  bloqueada: 'bg-slate-200 text-slate-700'
};

interface TramiteTareasPanelProps {
  tareas: Tarea[];
  onChangeEstado: (tareaId: string, estado: TareaEstado) => void;
  onOpenAgenda: () => void;
  onNuevaTarea: () => void;
}

const TramiteTareasPanel = ({
  tareas,
  onChangeEstado,
  onOpenAgenda,
  onNuevaTarea
}: TramiteTareasPanelProps) => {
  if (tareas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
        <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          No hay tareas enlazadas a este trámite
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Las tareas de la agenda vinculadas a este cliente o caso aparecerán aquí.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={onNuevaTarea}>
            Nueva tarea
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenAgenda}>
            Ver agenda
          </Button>
        </div>
      </div>
    );
  }

  const abiertas = tareas.filter((t) => t.estado !== 'hecha').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {tareas.length} tarea{tareas.length === 1 ? '' : 's'}
          {abiertas > 0 ? ` · ${abiertas} abierta${abiertas === 1 ? '' : 's'}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onNuevaTarea}>
            Nueva tarea
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenAgenda}>
            <ExternalLink className="h-4 w-4" />
            Agenda
          </Button>
        </div>
      </div>

      <ul className="space-y-3">
        {tareas.map((t) => (
          <li
            key={t.id}
            className={`rounded-2xl border p-4 ${
              t.estado === 'hecha'
                ? 'border-slate-100 bg-slate-50/80 opacity-80'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                    {staffLabel(t.asignadoA)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ESTADO_STYLE[t.estado]}`}
                  >
                    {ESTADO_LABEL[t.estado]}
                  </span>
                  {t.origen === 'excel' && (
                    <span className="text-[10px] text-amber-700">Excel</span>
                  )}
                  {!t.tramiteId && (
                    <span className="text-[10px] text-slate-400">Cliente (sin trámite fijo)</span>
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
              </div>
              <label className="block shrink-0 text-xs sm:text-right">
                <span className="mb-1 block font-medium text-slate-500">Estado</span>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 sm:w-auto"
                  value={t.estado}
                  onChange={(e) => onChangeEstado(t.id, e.target.value as TareaEstado)}
                >
                  {(Object.keys(ESTADO_LABEL) as TareaEstado[]).map((estado) => (
                    <option key={estado} value={estado}>
                      {ESTADO_LABEL[estado]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TramiteTareasPanel;
