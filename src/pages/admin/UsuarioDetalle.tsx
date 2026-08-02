import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BellPlus,
  ChevronDown,
  ClipboardList,
  FileText,
  MessagesSquare,
  MoreHorizontal,
  Plus,
  Waypoints
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import TramiteTimeline from '../../components/admin/TramiteTimeline';
import ArchivosTramite from '../../components/admin/ArchivosTramite';
import CaducidadPriorityPanel from '../../components/admin/CaducidadPriorityPanel';
import ComunicacionesTimeline from '../../components/admin/ComunicacionesTimeline';
import TramiteTareasPanel from '../../components/admin/TramiteTareasPanel';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useTareas } from '../../hooks/useTareas';
import { getEtapaLabel } from '../../data/tramitesCatalog';
import { Comunicacion, TipoEtapa, Tramite, UsuarioConTramites } from '../../types/tramite';
import { useNotifications } from '../../components/common/NotificationProvider';

type VistaTramite = 'timeline' | 'archivos' | 'comunicaciones' | 'tareas';

const UsuarioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getUsuario,
    getUsuarioAsync,
    isLoaded,
    updateUsuario,
    updateTramite,
    updateEtapa,
    setEtapaActual,
    createCasoAdicional,
    upsertDocumento,
    removeDocumento,
    getComunicaciones,
    createComunicacion,
    deleteComunicacion,
    refresh
  } = useUsuarios();
  const { notify } = useNotifications();
  const { tareas, updateTarea } = useTareas();

  const [usuario, setUsuario] = useState<UsuarioConTramites | null>(null);
  const [comunicaciones, setComunicaciones] = useState<Comunicacion[]>([]);
  const [tramiteId, setTramiteId] = useState<string | null>(null);
  const [selectedEtapa, setSelectedEtapa] = useState<TipoEtapa | undefined>();
  const [vista, setVista] = useState<VistaTramite>('comunicaciones');
  const [showExtra, setShowExtra] = useState(false);
  const [showAcciones, setShowAcciones] = useState(false);
  const [datosAbiertos, setDatosAbiertos] = useState(false);
  const [extraTitulo, setExtraTitulo] = useState('Caso adicional');

  const load = async () => {
    const numericId = Number(id);
    if (!numericId) {
      navigate('/admin/usuarios');
      return;
    }
    const data =
      getUsuario(numericId) || (await getUsuarioAsync(numericId));
    if (!data) {
      if (isLoaded) navigate('/admin/usuarios');
      return;
    }
    setUsuario(data);
    setComunicaciones(await getComunicaciones(numericId));
    const principal = data.tramites.find((t) => !t.esCasoAdicional) || data.tramites[0];
    setTramiteId((prev) => prev || principal?.id || null);
    if (principal && !selectedEtapa) {
      setSelectedEtapa(principal.etapaActual);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoaded]);

  const tramite: Tramite | undefined = useMemo(
    () => usuario?.tramites.find((t) => t.id === tramiteId),
    [usuario, tramiteId]
  );

  const tareasDelTramite = useMemo(() => {
    if (!usuario || !tramite) return [];
    const principal =
      usuario.tramites.find((t) => !t.esCasoAdicional) || usuario.tramites[0];
    const esPrincipal = principal?.id === tramite.id;

    return tareas
      .filter((t) => {
        if (t.tramiteId) return t.tramiteId === tramite.id;
        // Tareas solo a nivel cliente: se muestran en el trámite principal
        return esPrincipal && t.usuarioId === usuario.id;
      })
      .sort((a, b) => {
        const rank = (e: string) =>
          e === 'bloqueada' ? 0 : e === 'en_curso' ? 1 : e === 'pendiente' ? 2 : 3;
        const d = rank(a.estado) - rank(b.estado);
        if (d !== 0) return d;
        return (b.creadoEn || '').localeCompare(a.creadoEn || '');
      });
  }, [usuario, tramite, tareas]);

  if (!usuario || !tramite) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando ficha...
      </div>
    );
  }

  const reloadLocal = async () => {
    await refresh();
    const data = getUsuario(usuario.id) || (await getUsuarioAsync(usuario.id));
    if (data) setUsuario(data);
    setComunicaciones(await getComunicaciones(usuario.id));
  };

  const tabs: { id: VistaTramite; label: string; short: string; icon: typeof Waypoints; count?: number }[] = [
    {
      id: 'comunicaciones',
      label: 'Comunicaciones',
      short: 'Comunic.',
      icon: MessagesSquare,
      count: comunicaciones.length
    },
    { id: 'timeline', label: 'Timeline', short: 'Timeline', icon: Waypoints },
    {
      id: 'tareas',
      label: 'Tareas',
      short: 'Tareas',
      icon: ClipboardList,
      count: tareasDelTramite.length
    },
    { id: 'archivos', label: 'Archivos', short: 'Archivos', icon: FileText }
  ];

  const goNuevaTarea = () =>
    navigate('/admin/agenda', {
      state: {
        openCreate: true,
        tab: 'tareas',
        usuarioId: usuario.id,
        tramiteId: tramite.id
      }
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl safe-px pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <div className="flex items-start justify-between gap-3">
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
                <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  {usuario.nombre}
                </h1>
                <p className="truncate text-xs text-slate-500">
                  ID {usuario.id} · {usuario.cedula}
                  {tramite.aseguradora ? ` · ${tramite.aseguradora}` : ''}
                </p>
              </div>
            </div>

            <div className="relative shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-600"
                onClick={() => setShowAcciones((v) => !v)}
                aria-expanded={showAcciones}
              >
                <MoreHorizontal className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Acciones</span>
                <ChevronDown
                  className={`ml-0.5 hidden h-3.5 w-3.5 sm:inline transition ${
                    showAcciones ? 'rotate-180' : ''
                  }`}
                />
              </Button>
              {showAcciones && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Cerrar menú"
                    onClick={() => setShowAcciones(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setShowAcciones(false);
                        goNuevaTarea();
                      }}
                    >
                      <BellPlus className="h-4 w-4 text-slate-400" />
                      Nueva tarea
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setShowAcciones(false);
                        navigate('/admin/agenda', {
                          state: {
                            openCreate: true,
                            tab: 'recordatorios',
                            usuarioId: usuario.id,
                            tramiteId: tramite.id
                          }
                        });
                      }}
                    >
                      Recordatorio
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setShowAcciones(false);
                        setExtraTitulo('Caso adicional');
                        setShowExtra(true);
                      }}
                    >
                      <Plus className="h-4 w-4 text-slate-400" />
                      Caso adicional
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navegación principal: prioridad de uso */}
          <nav
            className="mt-3 grid grid-cols-4 gap-1 border-t border-slate-100 pt-3 pb-3 sm:gap-2"
            aria-label="Secciones del trámite"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = vista === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVista(tab.id)}
                  className={`relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-center transition sm:min-h-[56px] sm:flex-row sm:gap-2 sm:px-3 ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  <span className="text-[11px] font-semibold leading-tight sm:text-sm">
                    <span className="sm:hidden">{tab.short}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span
                      className={`absolute -right-0.5 -top-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums sm:static sm:ml-0.5 ${
                        active ? 'bg-white/25 text-white' : 'bg-white text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 safe-px py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
        <CaducidadPriorityPanel
          tramite={tramite}
          editable
          onChange={(updates) => {
            void (async () => {
              await updateTramite(tramite.id, updates);
              await reloadLocal();
              notify({
                type: 'success',
                title: 'Plazos actualizados',
                message: 'Caducidad recalculada si aplica'
              });
            })();
          }}
        />

        {usuario.tramites.length > 1 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 sm:p-4">
            <p className="mb-2 text-sm font-medium text-amber-900">Trámites del usuario</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
              {usuario.tramites.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTramiteId(t.id);
                    setSelectedEtapa(t.etapaActual);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium ${
                    t.id === tramite.id
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {t.titulo}
                  {t.esCasoAdicional ? ' (adicional)' : ''}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-4 hidden items-baseline justify-between gap-2 border-b border-slate-100 pb-3 sm:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {tabs.find((t) => t.id === vista)?.label}
              </p>
              <p className="text-sm text-slate-500">
                {tramite.titulo}
                {tramite.estadoGeneral ? ` · ${tramite.estadoGeneral}` : ''}
              </p>
            </div>
            <p className="text-xs text-slate-400">{getEtapaLabel(tramite.etapaActual)}</p>
          </div>

          {vista === 'timeline' && (
            <TramiteTimeline
              tramite={tramite}
              selectedTipo={selectedEtapa}
              onSelect={setSelectedEtapa}
              onChangeEtapa={(tipo, updates) => {
                void (async () => {
                  await updateEtapa(tramite.id, tipo, updates);
                  await reloadLocal();
                })();
              }}
              onSetEtapaActual={(tipo) => {
                void (async () => {
                  await setEtapaActual(tramite.id, tipo);
                  await reloadLocal();
                  notify({
                    type: 'success',
                    title: 'Etapa actualizada',
                    message: getEtapaLabel(tipo)
                  });
                })();
              }}
            />
          )}
          {vista === 'archivos' && (
            <ArchivosTramite
              tramite={tramite}
              onUpload={(etapaTipo, checklistItemId, archivo, meta) => {
                void (async () => {
                  await upsertDocumento(tramite.id, etapaTipo, checklistItemId, archivo, meta);
                  await reloadLocal();
                })();
              }}
              onRemove={(etapaTipo, checklistItemId) => {
                void (async () => {
                  await removeDocumento(tramite.id, etapaTipo, checklistItemId);
                  await reloadLocal();
                  notify({
                    type: 'success',
                    title: 'Archivo eliminado',
                    message: 'Documento quitado del trámite'
                  });
                })();
              }}
            />
          )}
          {vista === 'comunicaciones' && (
            <ComunicacionesTimeline
              usuarioId={usuario.id}
              comunicaciones={comunicaciones}
              tramites={usuario.tramites}
              tramiteActualId={tramite.id}
              onCreate={(data) => {
                void (async () => {
                  await createComunicacion(data);
                  await reloadLocal();
                  notify({
                    type: 'success',
                    title: 'Comunicación registrada',
                    message: data.asunto || data.tipo
                  });
                })();
              }}
              onDelete={(commId) => {
                void (async () => {
                  await deleteComunicacion(commId);
                  await reloadLocal();
                  notify({
                    type: 'success',
                    title: 'Eliminada',
                    message: 'Comunicación quitada del historial'
                  });
                })();
              }}
            />
          )}
          {vista === 'tareas' && (
            <TramiteTareasPanel
              tareas={tareasDelTramite}
              onChangeEstado={(tareaId, estado) => {
                void (async () => {
                  await updateTarea(tareaId, { estado });
                  notify({
                    type: 'success',
                    title: 'Tarea actualizada',
                    message: estado.replace('_', ' ')
                  });
                })();
              }}
              onNuevaTarea={goNuevaTarea}
              onOpenAgenda={() =>
                navigate('/admin/agenda', { state: { tab: 'tareas', usuarioId: usuario.id } })
              }
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          <button
            type="button"
            onClick={() => setDatosAbiertos((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-6 sm:py-4"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">Datos del caso</h2>
              <p className="text-xs text-slate-500">
                Vinculación, trámite, alcance, gestión y observaciones
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-slate-400 transition ${
                datosAbiertos ? 'rotate-180' : ''
              }`}
            />
          </button>

          {datosAbiertos && (
            <div className="space-y-6 border-t border-slate-100 px-4 py-4 sm:px-6 sm:py-6">
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">Datos de vinculación</h3>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {(
                    [
                      ['nombre', 'Nombre'],
                      ['cedula', 'Cédula'],
                      ['celular', 'Celular'],
                      ['email', 'Correo'],
                      ['direccion', 'Dirección'],
                      ['ciudad', 'Ciudad']
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="text-sm">
                      <span className="mb-1 block font-medium text-slate-700">{label}</span>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                        value={(usuario[key] as string) || ''}
                        onChange={(e) => setUsuario({ ...usuario, [key]: e.target.value })}
                        onBlur={() => {
                          updateUsuario(usuario.id, { [key]: usuario[key] });
                          notify({ type: 'success', title: 'Guardado', message: label });
                          reloadLocal();
                        }}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
                  <label className="flex min-h-11 items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={usuario.poderesFirmados}
                      onChange={(e) => {
                        updateUsuario(usuario.id, { poderesFirmados: e.target.checked });
                        reloadLocal();
                      }}
                    />
                    Poderes firmados
                  </label>
                  <label className="flex min-h-11 items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={usuario.casoEntregado}
                      onChange={(e) => {
                        updateUsuario(usuario.id, { casoEntregado: e.target.checked });
                        reloadLocal();
                      }}
                    />
                    Caso entregado
                  </label>
                  <label className="flex min-h-11 items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={usuario.tieneVehiculoInvolucrado}
                      onChange={(e) => {
                        updateUsuario(usuario.id, { tieneVehiculoInvolucrado: e.target.checked });
                        reloadLocal();
                      }}
                    />
                    Vehículo involucrado
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">Trámite</h3>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Título</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      value={tramite.titulo}
                      onChange={(e) => {
                        const next = { ...tramite, titulo: e.target.value };
                        setUsuario({
                          ...usuario,
                          tramites: usuario.tramites.map((t) => (t.id === tramite.id ? next : t))
                        });
                      }}
                      onBlur={() => updateTramite(tramite.id, { titulo: tramite.titulo })}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Estado general</span>
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      value={tramite.estadoGeneral}
                      onChange={(e) => {
                        updateTramite(tramite.id, {
                          estadoGeneral: e.target.value as Tramite['estadoGeneral']
                        });
                        reloadLocal();
                      }}
                    >
                      <option value="activo">Activo</option>
                      <option value="en_espera">En espera</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Aseguradora</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      defaultValue={tramite.aseguradora || ''}
                      onBlur={(e) => {
                        updateTramite(tramite.id, { aseguradora: e.target.value });
                        reloadLocal();
                      }}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Etapa actual</span>
                    <input
                      readOnly
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                      value={getEtapaLabel(tramite.etapaActual)}
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="mb-1 block font-medium">Alcance</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      defaultValue={tramite.alcance || ''}
                      key={`alcance-${tramite.id}-${tramite.alcance || ''}`}
                      onBlur={(e) => {
                        void updateTramite(tramite.id, { alcance: e.target.value });
                        void reloadLocal();
                      }}
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    <span className="mb-1 block font-medium">Gestión</span>
                    <textarea
                      className="min-h-[72px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      defaultValue={tramite.gestion || ''}
                      key={`gestion-${tramite.id}-${tramite.gestion || ''}`}
                      onBlur={(e) => {
                        void updateTramite(tramite.id, { gestion: e.target.value });
                        void reloadLocal();
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">Observaciones</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Internas</span>
                    <textarea
                      className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      defaultValue={tramite.observacionesInternas || ''}
                      onBlur={(e) =>
                        updateTramite(tramite.id, { observacionesInternas: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Para el cliente</span>
                    <textarea
                      className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
                      defaultValue={tramite.observacionesCliente || ''}
                      onBlur={(e) =>
                        updateTramite(tramite.id, { observacionesCliente: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Modal isOpen={showExtra} onClose={() => setShowExtra(false)} title="Crear caso adicional">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Solo úsalo cuando el usuario tenga explícitamente más de un caso.
          </p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Título</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={extraTitulo}
              onChange={(e) => setExtraTitulo(e.target.value)}
            />
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowExtra(false)}>
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                void (async () => {
                  const created = await createCasoAdicional(usuario.id, { titulo: extraTitulo });
                  setShowExtra(false);
                  setTramiteId(created.id);
                  setSelectedEtapa(created.etapaActual);
                  await reloadLocal();
                  notify({
                    type: 'success',
                    title: 'Caso adicional creado',
                    message: created.titulo
                  });
                })();
              }}
            >
              Crear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsuarioDetalle;
