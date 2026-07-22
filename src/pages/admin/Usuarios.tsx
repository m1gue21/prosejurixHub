import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  LogOut,
  Plus,
  Users,
  FileText,
  Scale,
  Gavel,
  CheckCircle,
  Handshake
} from 'lucide-react';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import VinculacionForm from '../../components/admin/VinculacionForm';
import { useUsuarios } from '../../hooks/useUsuarios';
import { getEtapaLabel } from '../../data/tramitesCatalog';
import {
  formatFechaEs,
  getCaducidadInfo,
  urgenciaRank,
  urgenciaStyles
} from '../../lib/caducidad';
import { useNotifications } from '../../components/common/NotificationProvider';
import { useConfirm } from '../../components/common/ConfirmProvider';

const Usuarios = () => {
  const navigate = useNavigate();
  const { usuarios, isLoaded, stats, createUsuario, deleteUsuario } = useUsuarios();
  const { notify } = useNotifications();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = !q
      ? usuarios
      : usuarios.filter(
          (u) =>
            u.nombre.toLowerCase().includes(q) ||
            u.cedula.toLowerCase().includes(q) ||
            (u.ciudad || '').toLowerCase().includes(q)
        );

    return [...list].sort((a, b) => {
      const ta = a.tramites.find((t) => !t.esCasoAdicional) || a.tramites[0];
      const tb = b.tramites.find((t) => !t.esCasoAdicional) || b.tramites[0];
      const ia = ta ? getCaducidadInfo(ta) : null;
      const ib = tb ? getCaducidadInfo(tb) : null;
      const ra = ia ? urgenciaRank(ia.urgencia) : 9;
      const rb = ib ? urgenciaRank(ib.urgencia) : 9;
      if (ra !== rb) return ra - rb;
      const da = ia?.diasRestantes ?? 99999;
      const db = ib?.diasRestantes ?? 99999;
      return da - db;
    });
  }, [usuarios, search]);

  const cards = [
    { title: 'Usuarios', value: stats.totalUsuarios, icon: Users, gradient: 'from-sky-500 to-blue-600' },
    { title: 'Activos', value: stats.activos, icon: FileText, gradient: 'from-amber-500 to-orange-600' },
    { title: 'Reclamación', value: stats.enReclamacion, icon: Handshake, gradient: 'from-fuchsia-500 to-purple-600' },
    { title: 'Conciliación', value: stats.enConciliacion, icon: Scale, gradient: 'from-lime-500 to-emerald-600' },
    { title: 'Judicial', value: stats.enJudicial, icon: Gavel, gradient: 'from-slate-600 to-slate-800' },
    { title: 'Finalizados', value: stats.finalizados, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-8">
      <header className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl safe-px py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.35em] text-blue-200/70 sm:text-xs">
                Gestión Prosejurix
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Usuarios y trámites</h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100/80">
                El eje del panel es el usuario. Cada uno tiene un trámite con etapas del diagrama operativo.
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => navigate('/')}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Vincular usuario
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl safe-px py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900 sm:mb-6 sm:px-4 sm:text-sm">
          <strong>Modo demo local:</strong> datos en el navegador. Portal: ID 1, 4 o 5.
        </div>

        <div className="-mx-4 mb-6 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`min-w-[140px] shrink-0 rounded-2xl bg-gradient-to-br ${card.gradient} p-3 text-white shadow-lg sm:min-w-0 sm:rounded-3xl sm:p-4`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/70">{card.title}</p>
                    <p className="mt-1 text-2xl font-semibold sm:text-3xl">{card.value}</p>
                  </div>
                  <Icon className="h-5 w-5 opacity-80 sm:h-6 sm:w-6" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:rounded-3xl sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Listado de usuarios</h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                Ordenados por urgencia de caducidad · {filtered.length} usuarios
              </p>
            </div>
            <div className="w-full sm:max-w-sm">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Buscar usuario..."
                className="max-w-none"
              />
            </div>
          </div>

          {!isLoaded ? (
            <p className="py-12 text-center text-slate-500">Cargando usuarios...</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-slate-500">No hay usuarios que coincidan.</p>
          ) : (
            <>
              {/* Cards móviles */}
              <div className="space-y-3 md:hidden">
                {filtered.map((u) => {
                  const principal = u.tramites.find((t) => !t.esCasoAdicional) || u.tramites[0];
                  const cad = principal ? getCaducidadInfo(principal) : null;
                  const badge = cad ? urgenciaStyles[cad.urgencia].badge : '';
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => navigate(`/admin/usuarios/${u.id}`)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left transition active:scale-[0.99] hover:border-slate-200 hover:bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">#{u.id}</span>
                          {cad && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                              Caducidad {formatFechaEs(cad.caducidad)}
                            </span>
                          )}
                          {u.tramites.length > 1 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              +{u.tramites.length - 1} caso
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate font-semibold text-slate-900">{u.nombre}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Accidente {formatFechaEs(principal?.fechaAccidente)}
                          {principal?.fechaEstructuracion
                            ? ` · Estruct. ${formatFechaEs(principal.fechaEstructuracion)}`
                            : ''}
                        </p>
                        <p className="mt-2 text-sm text-blue-700">
                          {principal ? getEtapaLabel(principal.etapaActual, true) : 'Sin trámite'}
                          <span className="ml-2 capitalize text-slate-500">
                            · {principal?.estadoGeneral || '—'}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                    </button>
                  );
                })}
              </div>

              {/* Tabla desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-3">ID</th>
                      <th className="px-3 py-3">Usuario</th>
                      <th className="px-3 py-3">Accidente</th>
                      <th className="px-3 py-3">Caducidad</th>
                      <th className="px-3 py-3">Etapa actual</th>
                      <th className="px-3 py-3">Estado</th>
                      <th className="px-3 py-3">Ciudad</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const principal = u.tramites.find((t) => !t.esCasoAdicional) || u.tramites[0];
                      const cad = principal ? getCaducidadInfo(principal) : null;
                      return (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-3 font-mono text-slate-500">{u.id}</td>
                          <td className="px-3 py-3 font-semibold text-slate-900">{u.nombre}</td>
                          <td className="px-3 py-3 text-slate-700">
                            {formatFechaEs(principal?.fechaAccidente)}
                          </td>
                          <td className="px-3 py-3">
                            {cad ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${urgenciaStyles[cad.urgencia].badge}`}
                              >
                                {formatFechaEs(cad.caducidad)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {principal ? getEtapaLabel(principal.etapaActual, true) : '—'}
                            {u.tramites.length > 1 && (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                +{u.tramites.length - 1} caso
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 capitalize">{principal?.estadoGeneral || '—'}</td>
                          <td className="px-3 py-3">{u.ciudad || '—'}</td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => navigate(`/admin/usuarios/${u.id}`)}>
                                Abrir
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={async () => {
                                  const ok = await confirm({
                                    title: 'Eliminar usuario',
                                    message: `¿Eliminar a ${u.nombre} y sus trámites?`,
                                    confirmText: 'Eliminar'
                                  });
                                  if (!ok) return;
                                  deleteUsuario(u.id);
                                  notify({
                                    type: 'success',
                                    title: 'Usuario eliminado',
                                    message: u.nombre
                                  });
                                }}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Barra fija móvil */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur safe-pb sm:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/')}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
          <Button className="flex-[1.4]" onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Vincular
          </Button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva vinculación">
        <VinculacionForm
          onCancel={() => setShowModal(false)}
          onSubmit={(data) => {
            const created = createUsuario(data);
            setShowModal(false);
            notify({
              type: 'success',
              title: 'Usuario vinculado',
              message: `${created.nombre} (ID ${created.id})`
            });
            navigate(`/admin/usuarios/${created.id}`);
          }}
        />
      </Modal>
    </div>
  );
};

export default Usuarios;
