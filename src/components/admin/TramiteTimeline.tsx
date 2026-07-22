import { CheckCircle2, Circle, PlayCircle, Ban, PauseCircle } from 'lucide-react';
import { getEtapaCatalog, getEtapaLabel, PIPELINE_LAYOUT } from '../../data/tramitesCatalog';
import { EtapaTramite, TipoEtapa, Tramite } from '../../types/tramite';

interface TramiteTimelineProps {
  tramite: Tramite;
  selectedTipo?: TipoEtapa;
  onSelect: (tipo: TipoEtapa) => void;
}

const flatten = (layout: Array<TipoEtapa | TipoEtapa[]>): TipoEtapa[] =>
  layout.flatMap((n) => (Array.isArray(n) ? n : [n]));

const iconFor = (etapa: EtapaTramite) => {
  switch (etapa.estado) {
    case 'completada':
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case 'en_curso':
      return <PlayCircle className="h-5 w-5 text-blue-600" />;
    case 'no_aplica':
      return <Ban className="h-5 w-5 text-slate-400" />;
    case 'omitida':
      return <PauseCircle className="h-5 w-5 text-amber-500" />;
    default:
      return <Circle className="h-5 w-5 text-slate-300" />;
  }
};

const estadoLabel: Record<EtapaTramite['estado'], string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  completada: 'Completada',
  no_aplica: 'No aplica',
  omitida: 'Omitida'
};

const TramiteTimeline = ({ tramite, selectedTipo, onSelect }: TramiteTimelineProps) => {
  const byTipo = new Map(tramite.etapas.map((e) => [e.tipo, e]));
  const ordered = flatten(PIPELINE_LAYOUT)
    .map((tipo) => byTipo.get(tipo))
    .filter((e): e is EtapaTramite => Boolean(e));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="mb-5 sm:mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Timeline</p>
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
          Estado del trámite en el tiempo
        </h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Vista secuencial de las etapas. Las médicas pueden avanzar en paralelo.
        </p>
      </div>

      <ol className="relative ml-2 space-y-0 border-l-2 border-slate-200 sm:ml-3">
        {ordered.map((etapa) => {
          const catalog = getEtapaCatalog(etapa.tipo);
          const isActual = tramite.etapaActual === etapa.tipo;
          const selected = selectedTipo === etapa.tipo;
          const docsTotal = etapa.checklist.filter((c) => c.requiereDocumento).length;
          const docsOk = etapa.checklist.filter((c) => c.requiereDocumento && c.archivo).length;
          const parallelNote = catalog.paraleloCon?.length
            ? `Paralelo con ${catalog.paraleloCon.map((t) => getEtapaLabel(t)).join(', ')}`
            : null;

          return (
            <li key={etapa.id} className="relative pb-6 pl-6 last:pb-0 sm:pb-8 sm:pl-8">
              <span
                className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white sm:-left-[11px] sm:h-5 sm:w-5 ${
                  isActual ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                {iconFor(etapa)}
              </span>

              <button
                type="button"
                disabled={etapa.estado === 'no_aplica'}
                onClick={() => onSelect(etapa.tipo)}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition sm:px-4 ${
                  selected
                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                    : etapa.estado === 'no_aplica'
                      ? 'border-slate-100 bg-slate-50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{getEtapaLabel(etapa.tipo)}</p>
                    <p className="text-xs text-slate-500">
                      {estadoLabel[etapa.estado]}
                      {etapa.subestado ? ` · ${String(etapa.subestado).replace(/_/g, ' ')}` : ''}
                    </p>
                    {parallelNote && (
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-violet-600">
                        {parallelNote}
                      </p>
                    )}
                  </div>
                  <div className="text-left text-xs text-slate-500 sm:text-right">
                    {etapa.fechaInicio && <p>Inicio: {etapa.fechaInicio}</p>}
                    {etapa.fechaFin && <p>Fin: {etapa.fechaFin}</p>}
                    {docsTotal > 0 && (
                      <p className="mt-1 font-medium text-slate-700">
                        Docs {docsOk}/{docsTotal}
                      </p>
                    )}
                  </div>
                </div>
                {(etapa.notasCliente || etapa.notasInternas) && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {etapa.notasCliente || etapa.notasInternas}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default TramiteTimeline;
