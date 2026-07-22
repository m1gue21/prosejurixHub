import { AlertTriangle, CalendarClock, CalendarDays } from 'lucide-react';
import {
  formatFechaEs,
  getCaducidadInfo,
  labelTipoResponsabilidad,
  urgenciaStyles
} from '../../lib/caducidad';
import { Tramite } from '../../types/tramite';

interface CaducidadPriorityPanelProps {
  tramite: Tramite;
  editable?: boolean;
  onChange?: (updates: Partial<Tramite>) => void;
}

const CaducidadPriorityPanel = ({
  tramite,
  editable = false,
  onChange
}: CaducidadPriorityPanelProps) => {
  const info = getCaducidadInfo(tramite);
  const styles = urgenciaStyles[info.urgencia];

  return (
    <section className={`rounded-2xl border p-4 shadow-sm sm:rounded-3xl sm:p-6 ${styles.panel}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
            Plazos prioritarios
          </p>
          <h2 className={`mt-1 text-lg font-bold sm:text-xl ${styles.accent}`}>
            Accidente, estructuración y caducidad
          </h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">{info.reglaLabel}</p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${styles.badge}`}
        >
          {(info.urgencia === 'vencida' || info.urgencia === 'critica') && (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {info.labelUrgencia}
        </span>
      </div>

      {editable && onChange ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-800">
              <CalendarDays className="h-4 w-4" />
              Fecha accidente
            </span>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              value={tramite.fechaAccidente || ''}
              onChange={(e) => onChange({ fechaAccidente: e.target.value || undefined })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-800">
              <CalendarDays className="h-4 w-4" />
              Fecha estructuración
            </span>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              value={tramite.fechaEstructuracion || ''}
              onChange={(e) => onChange({ fechaEstructuracion: e.target.value || undefined })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-800">Tipo de responsabilidad</span>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              value={
                info.tipo === 'contractual'
                  ? 'Contractual'
                  : info.tipo === 'extracontractual'
                    ? 'Extracontractual'
                    : ''
              }
              onChange={(e) => onChange({ responsabilidad: e.target.value || undefined })}
            >
              <option value="">Seleccionar…</option>
              <option value="Extracontractual">Extracontractual (5 años)</option>
              <option value="Contractual">Contractual (2 años)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 flex items-center gap-1.5 font-semibold text-slate-800">
              <CalendarClock className="h-4 w-4" />
              Caducidad
            </span>
            <input
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 font-semibold text-slate-900"
              value={info.caducidad ? formatFechaEs(info.caducidad) : 'Se calcula al completar datos'}
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Automática desde el accidente
            </span>
          </label>
        </div>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Accidente</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {formatFechaEs(info.fechaAccidente)}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Estructuración</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {formatFechaEs(info.fechaEstructuracion)}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Tipo</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {labelTipoResponsabilidad(info.tipo)}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Caducidad</dt>
            <dd className="mt-1 text-base font-semibold text-slate-900">
              {formatFechaEs(info.caducidad)}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
};

export default CaducidadPriorityPanel;
