import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, GitBranch, MessagesSquare, Plus, Waypoints } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import TramitePipeline from '../../components/admin/TramitePipeline';
import TramiteTimeline from '../../components/admin/TramiteTimeline';
import ArchivosTramite from '../../components/admin/ArchivosTramite';
import ComunicacionesTimeline from '../../components/admin/ComunicacionesTimeline';
import EtapaPanel from '../../components/admin/EtapaPanel';
import { useUsuarios } from '../../hooks/useUsuarios';
import { getEtapaLabel } from '../../data/tramitesCatalog';
import { Comunicacion, TipoEtapa, Tramite, UsuarioConTramites } from '../../types/tramite';
import { useNotifications } from '../../components/common/NotificationProvider';

type VistaTramite = 'pipeline' | 'timeline' | 'archivos' | 'comunicaciones';

const UsuarioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getUsuario,
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

  const [usuario, setUsuario] = useState<UsuarioConTramites | null>(null);
  const [comunicaciones, setComunicaciones] = useState<Comunicacion[]>([]);
  const [tramiteId, setTramiteId] = useState<string | null>(null);
  const [selectedEtapa, setSelectedEtapa] = useState<TipoEtapa | undefined>();
  const [vista, setVista] = useState<VistaTramite>('timeline');
  const [showExtra, setShowExtra] = useState(false);
  const [extraTitulo, setExtraTitulo] = useState('Caso adicional');

  const load = () => {
    const numericId = Number(id);
    if (!numericId) {
      navigate('/admin/usuarios');
      return;
    }
    const data = getUsuario(numericId);
    if (!data) {
      navigate('/admin/usuarios');
      return;
    }
    setUsuario(data);
    setComunicaciones(getComunicaciones(numericId));
    const principal = data.tramites.find((t) => !t.esCasoAdicional) || data.tramites[0];
    setTramiteId((prev) => prev || principal?.id || null);
    if (principal && !selectedEtapa) {
      setSelectedEtapa(principal.etapaActual);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tramite: Tramite | undefined = useMemo(
    () => usuario?.tramites.find((t) => t.id === tramiteId),
    [usuario, tramiteId]
  );

  const etapa = useMemo(
    () => tramite?.etapas.find((e) => e.tipo === selectedEtapa),
    [tramite, selectedEtapa]
  );

  if (!usuario || !tramite) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Cargando ficha...
      </div>
    );
  }

  const reloadLocal = () => {
    refresh();
    const data = getUsuario(usuario.id);
    if (data) setUsuario(data);
    setComunicaciones(getComunicaciones(usuario.id));
  };

  const tabs: { id: VistaTramite; label: string; icon: typeof Waypoints }[] = [
    { id: 'timeline', label: 'Timeline', icon: Waypoints },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'comunicaciones', label: 'Comunicaciones', icon: MessagesSquare },
    { id: 'archivos', label: 'Archivos', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 safe-px py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
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
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 sm:text-xs">
                Ficha de usuario
              </p>
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                {usuario.nombre}
              </h1>
              <p className="truncate text-xs text-slate-500 sm:text-sm">
                ID {usuario.id} · Cédula {usuario.cedula}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setExtraTitulo('Caso adicional');
              setShowExtra(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Caso adicional
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 safe-px py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900 sm:mb-4 sm:text-lg">
            Datos de vinculación
          </h2>
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
        </section>

        {usuario.tramites.length > 1 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 sm:rounded-3xl sm:p-4">
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
          <div className="mb-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
          </div>

          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto border-b border-slate-100 px-4 pb-4 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVista(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    vista === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {vista === 'pipeline' && (
            <TramitePipeline
              tramite={tramite}
              selectedTipo={selectedEtapa}
              onSelect={(tipo) => setSelectedEtapa(tipo)}
            />
          )}
          {vista === 'timeline' && (
            <TramiteTimeline
              tramite={tramite}
              selectedTipo={selectedEtapa}
              onSelect={(tipo) => setSelectedEtapa(tipo)}
            />
          )}
          {vista === 'archivos' && (
            <ArchivosTramite
              tramite={tramite}
              onUpload={(etapaTipo, checklistItemId, archivo) => {
                upsertDocumento(tramite.id, etapaTipo, checklistItemId, archivo);
                reloadLocal();
              }}
              onRemove={(etapaTipo, checklistItemId) => {
                removeDocumento(tramite.id, etapaTipo, checklistItemId);
                reloadLocal();
                notify({
                  type: 'success',
                  title: 'Archivo eliminado',
                  message: 'Documento quitado del trámite'
                });
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
                createComunicacion(data);
                reloadLocal();
                notify({
                  type: 'success',
                  title: 'Comunicación registrada',
                  message: data.asunto || data.tipo
                });
              }}
              onDelete={(commId) => {
                deleteComunicacion(commId);
                reloadLocal();
                notify({
                  type: 'success',
                  title: 'Eliminada',
                  message: 'Comunicación quitada del historial'
                });
              }}
            />
          )}
        </section>

        {vista !== 'archivos' && vista !== 'comunicaciones' && etapa && (
          <EtapaPanel
            etapa={etapa}
            isEtapaActual={tramite.etapaActual === etapa.tipo}
            onSetActual={() => {
              setEtapaActual(tramite.id, etapa.tipo);
              reloadLocal();
              notify({
                type: 'success',
                title: 'Etapa actualizada',
                message: getEtapaLabel(etapa.tipo)
              });
            }}
            onChange={(updates) => {
              updateEtapa(tramite.id, etapa.tipo, updates);
              reloadLocal();
            }}
          />
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <h2 className="mb-3 text-base font-semibold sm:text-lg">Observaciones del trámite</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Internas</span>
              <textarea
                className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
                defaultValue={tramite.observacionesInternas || ''}
                onBlur={(e) => updateTramite(tramite.id, { observacionesInternas: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Para el cliente</span>
              <textarea
                className="min-h-[100px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
                defaultValue={tramite.observacionesCliente || ''}
                onBlur={(e) => updateTramite(tramite.id, { observacionesCliente: e.target.value })}
              />
            </label>
          </div>
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
                const created = createCasoAdicional(usuario.id, { titulo: extraTitulo });
                setShowExtra(false);
                setTramiteId(created.id);
                setSelectedEtapa(created.etapaActual);
                reloadLocal();
                notify({
                  type: 'success',
                  title: 'Caso adicional creado',
                  message: created.titulo
                });
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
