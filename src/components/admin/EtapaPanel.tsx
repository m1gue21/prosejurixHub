import { useRef, useState } from 'react';
import { Download, ExternalLink, Eye, Replace, Trash2, Upload } from 'lucide-react';
import Button from '../common/Button';
import DocumentoPreviewModal from './DocumentoPreviewModal';
import { getEtapaCatalog, getEtapaLabel } from '../../data/tramitesCatalog';
import {
  createDocumentoFromFile,
  formatBytes,
  formatFechaDoc,
  getDocumentoSource,
  upsertChecklistArchivo
} from '../../lib/documentHelpers';
import { ChecklistItem, DocumentoArchivo, EtapaTramite } from '../../types/tramite';
import { useNotifications } from '../common/NotificationProvider';

interface EtapaPanelProps {
  etapa: EtapaTramite;
  isEtapaActual: boolean;
  onChange: (updates: Partial<EtapaTramite> & { checklist?: ChecklistItem[] }) => void;
  onSetActual: () => void;
}

const EtapaPanel = ({ etapa, isEtapaActual, onChange, onSetActual }: EtapaPanelProps) => {
  const catalog = getEtapaCatalog(etapa.tipo);
  const { notify } = useNotifications();
  const inputRef = useRef<HTMLInputElement>(null);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ archivo: DocumentoArchivo; titulo: string } | null>(null);

  const toggleChecklist = (itemId: string) => {
    const item = etapa.checklist.find((c) => c.id === itemId);
    if (item?.requiereDocumento) return;
    const checklist = etapa.checklist.map((c) =>
      c.id === itemId ? { ...c, completado: !c.completado } : c
    );
    onChange({ checklist });
  };

  const openFilePicker = (itemId: string) => {
    setTargetItemId(itemId);
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = targetItemId;
    e.target.value = '';
    setTargetItemId(null);
    if (!file || !itemId) return;

    try {
      const archivo = await createDocumentoFromFile(file);
      onChange({ checklist: upsertChecklistArchivo(etapa.checklist, itemId, archivo) });
      notify({ type: 'success', title: 'Documento cargado', message: file.name });
    } catch (err) {
      notify({
        type: 'error',
        title: 'Error al subir',
        message: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  };

  const removeFile = (itemId: string) => {
    onChange({ checklist: upsertChecklistArchivo(etapa.checklist, itemId, undefined) });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,image/*,application/pdf"
        onChange={handleFile}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Etapa</p>
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{getEtapaLabel(etapa.tipo)}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Vista cliente: {getEtapaLabel(etapa.tipo, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEtapaActual && etapa.estado !== 'no_aplica' && (
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={onSetActual}>
              Marcar como actual
            </Button>
          )}
          {isEtapaActual && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Etapa actual
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Estado</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={etapa.estado}
            onChange={(e) => onChange({ estado: e.target.value as EtapaTramite['estado'] })}
            disabled={etapa.estado === 'no_aplica' && etapa.tipo === 'liberacion_vehiculos'}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="completada">Completada</option>
            <option value="no_aplica">No aplica</option>
            <option value="omitida">Omitida</option>
          </select>
        </label>

        {catalog.subestados && catalog.subestados.length > 0 && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Subestado</span>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={etapa.subestado || ''}
              onChange={(e) => onChange({ subestado: e.target.value })}
            >
              <option value="">Sin subestado</option>
              {catalog.subestados.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Fecha inicio</span>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={etapa.fechaInicio || ''}
            onChange={(e) => onChange({ fechaInicio: e.target.value })}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Fecha fin</span>
          <input
            type="date"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            value={etapa.fechaFin || ''}
            onChange={(e) => onChange({ fechaFin: e.target.value })}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Documentos y acciones</p>
        <ul className="space-y-3">
          {etapa.checklist.map((item) => {
            const src = getDocumentoSource(item.archivo);
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-100 px-3 py-3 hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 shrink-0"
                      checked={item.completado}
                      disabled={item.requiereDocumento}
                      onChange={() => toggleChecklist(item.id)}
                      title={
                        item.requiereDocumento
                          ? 'Se completa al subir el documento'
                          : 'Marcar acción'
                      }
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm ${
                          item.completado ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.requiereDocumento && item.archivo && src && (
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
                          title="Abrir documento"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.archivo.nombre}</span>
                        </a>
                      )}
                      {item.requiereDocumento && (
                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          {item.archivo
                            ? `${formatFechaDoc(item.archivo.fechaAnadido)} · ${formatBytes(item.archivo.size)}`
                            : 'Requiere documento · pendiente'}
                        </span>
                      )}
                    </span>
                  </div>

                  {item.requiereDocumento && (
                    <div className="mt-2 grid w-full grid-cols-2 gap-2 sm:mt-0 sm:flex sm:w-auto sm:flex-wrap">
                      {item.archivo && src && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() =>
                              setPreview({ archivo: item.archivo!, titulo: item.label })
                            }
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = src;
                              a.download = item.archivo!.nombre;
                              a.target = '_blank';
                              a.click();
                            }}
                          >
                            <Download className="mr-1 h-3.5 w-3.5" />
                            Bajar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => openFilePicker(item.id)}
                          >
                            <Replace className="mr-1 h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="w-full sm:w-auto"
                            onClick={() => removeFile(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {!item.archivo && (
                        <Button
                          size="sm"
                          className="col-span-2 w-full sm:col-span-1 sm:w-auto"
                          onClick={() => openFilePicker(item.id)}
                        >
                          <Upload className="mr-1 h-3.5 w-3.5" />
                          Subir
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Notas internas</span>
          <textarea
            className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
            value={etapa.notasInternas || ''}
            onChange={(e) => onChange({ notasInternas: e.target.value })}
            placeholder="Solo visibles para el equipo"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Notas para el cliente</span>
          <textarea
            className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
            value={etapa.notasCliente || ''}
            onChange={(e) => onChange({ notasCliente: e.target.value })}
            placeholder="Visible en el portal"
          />
        </label>
      </div>

      <DocumentoPreviewModal
        open={Boolean(preview)}
        archivo={preview?.archivo || null}
        titulo={preview?.titulo}
        onClose={() => setPreview(null)}
      />
    </div>
  );
};

export default EtapaPanel;
