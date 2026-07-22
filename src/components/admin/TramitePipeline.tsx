import { CheckCircle2, Circle, PauseCircle, Ban, PlayCircle } from 'lucide-react';
import { PIPELINE_LAYOUT, getEtapaLabel } from '../../data/tramitesCatalog';
import { EtapaTramite, TipoEtapa, Tramite } from '../../types/tramite';

interface TramitePipelineProps {
  tramite: Tramite;
  selectedTipo?: TipoEtapa;
  onSelect: (tipo: TipoEtapa) => void;
}

const estadoIcon = (etapa: EtapaTramite) => {
  switch (etapa.estado) {
    case 'completada':
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />;
    case 'en_curso':
      return <PlayCircle className="h-4 w-4 shrink-0 text-blue-600" />;
    case 'no_aplica':
      return <Ban className="h-4 w-4 shrink-0 text-slate-400" />;
    case 'omitida':
      return <PauseCircle className="h-4 w-4 shrink-0 text-amber-500" />;
    default:
      return <Circle className="h-4 w-4 shrink-0 text-slate-300" />;
  }
};

const chipClass = (etapa: EtapaTramite, selected: boolean, isActual: boolean) => {
  const base =
    'flex w-full min-w-[160px] flex-col gap-1 rounded-2xl border px-3 py-3 text-left transition sm:min-w-[140px] sm:w-auto';
  if (etapa.estado === 'no_aplica') {
    return `${base} border-slate-200 bg-slate-50 text-slate-400 opacity-60`;
  }
  if (selected) {
    return `${base} border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10`;
  }
  if (isActual || etapa.estado === 'en_curso') {
    return `${base} border-blue-300 bg-white hover:border-blue-400`;
  }
  if (etapa.estado === 'completada') {
    return `${base} border-emerald-200 bg-emerald-50/50 hover:border-emerald-300`;
  }
  return `${base} border-slate-200 bg-white hover:border-slate-300`;
};

const TramitePipeline = ({ tramite, selectedTipo, onSelect }: TramitePipelineProps) => {
  const byTipo = new Map(tramite.etapas.map((e) => [e.tipo, e]));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pipeline del trámite</p>
          <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {tramite.titulo}
          </h3>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Actual: {getEtapaLabel(tramite.etapaActual, true)}
        </span>
      </div>

      {/* Móvil: scroll horizontal con snap */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scrollbar-none sm:hidden">
        {PIPELINE_LAYOUT.flatMap((node) => (Array.isArray(node) ? node : [node])).map((tipo) => {
          const etapa = byTipo.get(tipo);
          if (!etapa) return null;
          return (
            <button
              key={tipo}
              type="button"
              disabled={etapa.estado === 'no_aplica'}
              onClick={() => onSelect(tipo)}
              className={`${chipClass(etapa, selectedTipo === tipo, tramite.etapaActual === tipo)} snap-start`}
            >
              <div className="flex items-center gap-2">
                {estadoIcon(etapa)}
                <span className="text-sm font-medium text-slate-800">{getEtapaLabel(tipo, true)}</span>
              </div>
              <span className="text-[11px] capitalize text-slate-500">
                {etapa.estado.replace('_', ' ')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop: wrap */}
      <div className="hidden flex-wrap items-stretch gap-2 sm:flex">
        {PIPELINE_LAYOUT.map((node, idx) => {
          if (Array.isArray(node)) {
            return (
              <div key={`parallel-${idx}`} className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Paralelos</p>
                {node.map((tipo) => {
                  const etapa = byTipo.get(tipo);
                  if (!etapa) return null;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      disabled={etapa.estado === 'no_aplica'}
                      onClick={() => onSelect(tipo)}
                      className={chipClass(etapa, selectedTipo === tipo, tramite.etapaActual === tipo)}
                    >
                      <div className="flex items-center gap-2">
                        {estadoIcon(etapa)}
                        <span className="text-sm font-medium text-slate-800">
                          {getEtapaLabel(tipo)}
                        </span>
                      </div>
                      <span className="text-[11px] capitalize text-slate-500">
                        {etapa.estado.replace('_', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          }

          const etapa = byTipo.get(node);
          if (!etapa) return null;
          return (
            <button
              key={node}
              type="button"
              disabled={etapa.estado === 'no_aplica'}
              onClick={() => onSelect(node)}
              className={chipClass(etapa, selectedTipo === node, tramite.etapaActual === node)}
            >
              <div className="flex items-center gap-2">
                {estadoIcon(etapa)}
                <span className="text-sm font-medium text-slate-800">{getEtapaLabel(node)}</span>
              </div>
              <span className="text-[11px] capitalize text-slate-500">
                {etapa.estado.replace('_', ' ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TramitePipeline;
