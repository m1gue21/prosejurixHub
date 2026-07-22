import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import ClientLoginForm from '../../components/cliente/ClientLoginForm';
import { mockUserStore } from '../../lib/mockUserStore';
import { useNotifications } from '../../components/common/NotificationProvider';

const ClienteLogin = () => {
  const navigate = useNavigate();
  const { notify } = useNotifications();

  const handleLogin = async (clienteIdInput: string) => {
    const usuarioId = Number(String(clienteIdInput).trim());

    if (!usuarioId || Number.isNaN(usuarioId)) {
      notify({
        type: 'warning',
        title: 'ID inválido',
        message: 'Ingresa un número válido para continuar.'
      });
      return;
    }

    const usuario = mockUserStore.getUsuario(usuarioId);
    if (!usuario || usuario.tramites.length === 0) {
      notify({
        type: 'warning',
        title: 'Sin resultados',
        message: `No encontramos trámites para el usuario ${usuarioId}. Prueba con 1, 2, 4 o 5.`
      });
      return;
    }

    navigate('/portal/tramites', {
      state: {
        usuarioId: usuario.id,
        usuario,
        tramites: usuario.tramites
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="relative mx-auto w-full max-w-4xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 text-white">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-lg backdrop-blur transition hover:bg-white/20"
                aria-label="Volver a inicio"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-blue-200/70">Portal Digital</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Acceso al Portal del Cliente
                </h1>
                <p className="mt-3 max-w-xl text-sm text-blue-100/80">
                  Consulta el estado de tus trámites legales y sigue cada etapa de tu caso.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-blue-100/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium">
                <ShieldCheck className="h-4 w-4" /> Acceso seguro y confidencial
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium">
                <Sparkles className="h-4 w-4" /> Seguimiento por etapas
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative pb-16 safe-pb">
        <div className="mt-8 sm:mt-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 safe-px sm:flex-row sm:px-6 lg:px-8">
            <div className="flex-1">
              <ClientLoginForm onLogin={handleLogin} />
            </div>
            <aside className="flex w-full flex-col gap-6 sm:max-w-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:rounded-3xl sm:p-6">
                <h3 className="text-lg font-semibold text-slate-900">¿Qué necesitas?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Introduce el ID de usuario que recibiste de nuestro equipo. En modo demo puedes usar
                  1, 2, 4 o 5.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClienteLogin;
