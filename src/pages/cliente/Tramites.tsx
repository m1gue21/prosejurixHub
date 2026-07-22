import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, FileText, LogOut, UserCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { getEtapaLabel } from '../../data/tramitesCatalog';
import { Tramite, Usuario } from '../../types/tramite';

const ClienteTramites = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioId, usuario, tramites } = (location.state || {}) as {
    usuarioId?: number;
    usuario?: Usuario;
    tramites?: Tramite[];
  };

  useEffect(() => {
    if (!usuarioId || !usuario || !tramites?.length) {
      navigate('/portal');
    }
  }, [usuarioId, usuario, tramites, navigate]);

  if (!usuarioId || !usuario || !tramites?.length) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 safe-px py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-2.5 sm:p-3">
              <UserCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-blue-200/70 sm:text-xs">
                Mis trámites
              </p>
              <h1 className="truncate text-xl font-bold sm:text-2xl">{usuario.nombre}</h1>
              <p className="truncate text-xs text-blue-100/80 sm:text-sm">
                ID {usuario.id} · Cédula {usuario.cedula}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
            onClick={() => navigate('/portal')}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl safe-px py-5 sm:px-6 sm:py-8">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-3xl sm:p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h2 className="font-semibold text-slate-900">
                {tramites.length === 1 ? 'Tu trámite' : 'Tus trámites'}
              </h2>
              <p className="text-sm text-slate-500">
                Consulta la etapa actual y las novedades de tu caso.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {tramites.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {t.esCasoAdicional ? 'Caso adicional' : 'Trámite principal'}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
                    {t.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Etapa: <strong>{getEtapaLabel(t.etapaActual, true)}</strong>
                  </p>
                  <p className="mt-1 text-sm capitalize text-slate-500">Estado: {t.estadoGeneral}</p>
                  {t.observacionesCliente && (
                    <p className="mt-3 text-sm text-slate-600">{t.observacionesCliente}</p>
                  )}
                </div>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() =>
                    navigate(`/portal/tramites/${t.id}`, {
                      state: { usuarioId, usuario, tramites }
                    })
                  }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClienteTramites;
