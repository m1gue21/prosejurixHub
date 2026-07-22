import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Trash2
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  DIRECCIONES_COMUNICACION,
  TIPOS_COMUNICACION,
  getDireccionLabel,
  getTipoComunicacionLabel
} from '../../data/comunicacionesCatalog';
import {
  Comunicacion,
  DireccionComunicacion,
  TipoComunicacion,
  Tramite
} from '../../types/tramite';

interface ComunicacionesTimelineProps {
  usuarioId: number;
  comunicaciones: Comunicacion[];
  tramites: Tramite[];
  tramiteActualId?: string;
  onCreate: (data: Omit<Comunicacion, 'id'>) => void;
  onDelete: (id: string) => void;
}

const iconForTipo = (tipo: TipoComunicacion) => {
  switch (tipo) {
    case 'llamada':
      return Phone;
    case 'correo':
      return Mail;
    case 'visita_oficina':
      return Building2;
    case 'visita_cliente':
      return MapPin;
    default:
      return MessageSquare;
  }
};

const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInputValue = (value: string) => {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const formatFecha = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

type FiltroTipo = TipoComunicacion | 'todos';
type FiltroDir = DireccionComunicacion | 'todos';

const emptyForm = (tramiteId?: string) => ({
  tipo: 'mensaje' as TipoComunicacion,
  direccion: 'hacia_cliente' as DireccionComunicacion,
  fecha: toLocalInputValue(new Date().toISOString()),
  asunto: '',
  contenido: '',
  registradoPor: '',
  duracionMinutos: '',
  tramiteId: tramiteId || ''
});

const ComunicacionesTimeline = ({
  usuarioId,
  comunicaciones,
  tramites,
  tramiteActualId,
  onCreate,
  onDelete
}: ComunicacionesTimelineProps) => {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroDir, setFiltroDir] = useState<FiltroDir>('todos');
  const [soloTramiteActual, setSoloTramiteActual] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => emptyForm(tramiteActualId));

  const filtered = useMemo(() => {
    return comunicaciones.filter((c) => {
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
      if (filtroDir !== 'todos' && c.direccion !== filtroDir) return false;
      if (soloTramiteActual && tramiteActualId) {
        if (c.tramiteId && c.tramiteId !== tramiteActualId) return false;
      }
      return true;
    });
  }, [comunicaciones, filtroTipo, filtroDir, soloTramiteActual, tramiteActualId]);

  const openCreate = () => {
    setForm(emptyForm(tramiteActualId));
    setShowForm(true);
  };

  const submit = () => {
    if (!form.contenido.trim()) return;
    onCreate({
      usuarioId,
      tipo: form.tipo,
      direccion: form.direccion,
      fecha: fromLocalInputValue(form.fecha),
      asunto: form.asunto.trim() || undefined,
      contenido: form.contenido.trim(),
      registradoPor: form.registradoPor.trim() || undefined,
      duracionMinutos: form.duracionMinutos ? Number(form.duracionMinutos) : undefined,
      tramiteId: form.tramiteId || undefined
    });
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Comunicaciones</p>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            Historial de contacto con el cliente
          </h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Registra mensajes, llamadas, correos y visitas en ambas direcciones.
          </p>
        </div>
        <Button size="sm" className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS_COMUNICACION.map((t) => (
            <option key={t.id} value={t.id}>
              {t.short}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          value={filtroDir}
          onChange={(e) => setFiltroDir(e.target.value as FiltroDir)}
        >
          <option value="todos">Ambas direcciones</option>
          {DIRECCIONES_COMUNICACION.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        {tramiteActualId && tramites.length > 0 && (
          <label className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={soloTramiteActual}
              onChange={(e) => setSoloTramiteActual(e.target.checked)}
            />
            Solo trámite actual
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">Sin comunicaciones aún</p>
          <p className="mt-1 text-xs text-slate-500">
            Registra el primer contacto con el cliente.
          </p>
        </div>
      ) : (
        <ol className="relative ml-2 space-y-0 border-l-2 border-slate-200 sm:ml-3">
          {filtered.map((c) => {
            const Icon = iconForTipo(c.tipo);
            const haciaCliente = c.direccion === 'hacia_cliente';
            const tramiteLabel = tramites.find((t) => t.id === c.tramiteId)?.titulo;

            return (
              <li key={c.id} className="relative pb-5 pl-6 last:pb-0 sm:pb-6 sm:pl-8">
                <span
                  className={`absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white sm:-left-[13px] sm:h-6 sm:w-6 ${
                    haciaCliente ? 'border-blue-400 text-blue-600' : 'border-emerald-400 text-emerald-600'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>

                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {getTipoComunicacionLabel(c.tipo, true)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            haciaCliente
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {haciaCliente ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3" />
                          )}
                          {getDireccionLabel(c.direccion)}
                        </span>
                      </div>
                      {c.asunto && (
                        <p className="mt-1 text-sm font-medium text-slate-800">{c.asunto}</p>
                      )}
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                        {c.contenido}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span>{formatFecha(c.fecha)}</span>
                        {c.duracionMinutos != null && (
                          <span>{c.duracionMinutos} min</span>
                        )}
                        {c.registradoPor && <span>Por: {c.registradoPor}</span>}
                        {tramiteLabel && <span>Trámite: {tramiteLabel}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-10 items-center gap-1 self-start rounded-xl px-2 text-xs text-rose-600 hover:bg-rose-50"
                      onClick={() => onDelete(c.id)}
                      aria-label="Eliminar comunicación"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sm:hidden">Eliminar</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Registrar comunicación">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Tipo</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.tipo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tipo: e.target.value as TipoComunicacion }))
                }
              >
                {TIPOS_COMUNICACION.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Dirección</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.direccion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    direccion: e.target.value as DireccionComunicacion
                  }))
                }
              >
                {DIRECCIONES_COMUNICACION.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Fecha y hora</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Asunto (opcional)</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.asunto}
              onChange={(e) => setForm((f) => ({ ...f, asunto: e.target.value }))}
              placeholder="Ej. Seguimiento reclamación"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Detalle</span>
            <textarea
              className="min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={form.contenido}
              onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
              placeholder="Qué se dijo, acordó o envió..."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Registrado por</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.registradoPor}
                onChange={(e) => setForm((f) => ({ ...f, registradoPor: e.target.value }))}
                placeholder="Nombre o área"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">Duración (min)</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.duracionMinutos}
                onChange={(e) => setForm((f) => ({ ...f, duracionMinutos: e.target.value }))}
                placeholder="Opcional"
              />
            </label>
          </div>

          {tramites.length > 0 && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Trámite relacionado</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                value={form.tramiteId}
                onChange={(e) => setForm((f) => ({ ...f, tramiteId: e.target.value }))}
              >
                <option value="">Sin asociar / general</option>
                {tramites.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo}
                    {t.esCasoAdicional ? ' (adicional)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={!form.contenido.trim()}
              onClick={submit}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComunicacionesTimeline;
