import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import Button from '../../components/common/Button';
import { mockUserStore } from '../../lib/mockUserStore';
import { getEtapaLabel, PIPELINE_LAYOUT } from '../../data/tramitesCatalog';
import { TipoEtapa, Tramite, Usuario } from '../../types/tramite';

const flattenLayout = (layout: Array<TipoEtapa | TipoEtapa[]>): TipoEtapa[] =>
  layout.flatMap((node) => (Array.isArray(node) ? node : [node]));

const TramiteDetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuarioId, usuario, tramites } = (location.state || {}) as {
    usuarioId?: number;
    usuario?: Usuario;
    tramites?: Tramite[];
  };

  const tramite = useMemo(() => {
    if (!id) return undefined;
    return tramites?.find((t) => t.id === id) || mockUserStore.getTramite(id);
  }, [id, tramites]);

  useEffect(() => {
    if (!usuarioId || !usuario) {
      navigate('/portal');
    }
  }, [usuarioId, usuario, navigate]);

  if (!usuarioId || !usuario || !tramite) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-slate-500">
        Cargando trámite...
      </div>
    );
  }

  const etapaActual = tramite.etapas.find((e) => e.tipo === tramite.etapaActual);
  const visibles = flattenLayout(PIPELINE_LAYOUT)
    .map((tipo) => tramite.etapas.find((e) => e.tipo === tipo))
    .filter((e): e is NonNullable<typeof e> => Boolean(e) && e.estado !== 'no_aplica');

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-2 safe-px py-3 sm:gap-3 sm:px-6 sm:py-5">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() =>
              navigate('/portal/tramites', {
                state: {
                  usuarioId,
                  usuario,
                  tramites:
                    tramites ||
                    (usuario && mockUserStore.getUsuario(usuario.id)?.tramites)
                }
              })
            }
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 sm:text-xs">
              Detalle del trámite
            </p>
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-xl">
              {tramite.titulo}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 safe-px py-5 sm:space-y-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <p className="text-sm text-slate-500">Etapa actual</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {getEtapaLabel(tramite.etapaActual, true)}
          </h2>
          <p className="mt-2 capitalize text-slate-600">Estado general: {tramite.estadoGeneral}</p>
          {(etapaActual?.notasCliente || tramite.observacionesCliente) && (
            <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
              {etapaActual?.notasCliente || tramite.observacionesCliente}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
            Avance de tu caso
          </h3>
          <ol className="space-y-3">
            {visibles.map((etapa) => {
              const done = etapa.estado === 'completada';
              const current = etapa.tipo === tramite.etapaActual;
              return (
                <li
                  key={etapa.id}
                  className={`flex items-start gap-3 rounded-2xl border px-3 py-3 sm:px-4 ${
                    current ? 'border-blue-300 bg-blue-50' : 'border-slate-100'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        current ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {getEtapaLabel(etapa.tipo, true)}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {etapa.estado.replace('_', ' ')}
                      {etapa.subestado ? ` · ${etapa.subestado.replace(/_/g, ' ')}` : ''}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {(tramite.aseguradora || tramite.radicado || tramite.fechaAccidente) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">
              Información del caso
            </h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {tramite.fechaAccidente && (
                <>
                  <dt className="text-slate-500">Fecha del accidente</dt>
                  <dd className="font-medium text-slate-800">{tramite.fechaAccidente}</dd>
                </>
              )}
              {tramite.aseguradora && (
                <>
                  <dt className="text-slate-500">Aseguradora</dt>
                  <dd className="font-medium text-slate-800">{tramite.aseguradora}</dd>
                </>
              )}
              {tramite.radicado && (
                <>
                  <dt className="text-slate-500">Radicado</dt>
                  <dd className="break-all font-medium text-slate-800">{tramite.radicado}</dd>
                </>
              )}
              {tramite.lugarAccidente && (
                <>
                  <dt className="text-slate-500">Lugar</dt>
                  <dd className="font-medium text-slate-800">{tramite.lugarAccidente}</dd>
                </>
              )}
            </dl>
          </section>
        )}
      </main>
    </div>
  );
};

export default TramiteDetalleCliente;
