import { useMemo, useRef, useState } from 'react';
import {
  Download,
  Eye,
  FilePlus2,
  FileText,
  Replace,
  Trash2,
  Upload
} from 'lucide-react';
import Button from '../common/Button';
import DocumentoPreviewModal from './DocumentoPreviewModal';
import {
  DocumentoListItem,
  createDocumentoFromFile,
  formatBytes,
  formatFechaDoc,
  getDocumentoSource,
  listDocumentosTramite
} from '../../lib/documentHelpers';
import { DocumentoArchivo, TipoEtapa, Tramite } from '../../types/tramite';
import { useNotifications } from '../common/NotificationProvider';

interface ArchivosTramiteProps {
  tramite: Tramite;
  onUpload: (etapaTipo: TipoEtapa, checklistItemId: string, archivo: DocumentoArchivo) => void;
  onRemove: (etapaTipo: TipoEtapa, checklistItemId: string) => void;
}

const ArchivosTramite = ({ tramite, onUpload, onRemove }: ArchivosTramiteProps) => {
  const { notify } = useNotifications();
  const [filtro, setFiltro] = useState<'todos' | 'con_archivo' | 'pendientes'>('todos');
  const [preview, setPreview] = useState<{ archivo: DocumentoArchivo; titulo: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingUpload = useRef<{ etapaTipo: TipoEtapa; checklistItemId: string } | null>(null);

  const docs = useMemo(() => listDocumentosTramite(tramite), [tramite]);

  const filtered = useMemo(() => {
    if (filtro === 'con_archivo') return docs.filter((d) => d.archivo);
    if (filtro === 'pendientes') {
      return docs.filter((d) => d.requiereDocumento && !d.archivo);
    }
    return docs;
  }, [docs, filtro]);

  const conArchivo = docs.filter((d) => d.archivo).length;
  const pendientes = docs.filter((d) => d.requiereDocumento && !d.archivo).length;

  const triggerUpload = (item: DocumentoListItem) => {
    pendingUpload.current = { etapaTipo: item.etapaTipo, checklistItemId: item.checklistItemId };
    setUploadingKey(`${item.etapaTipo}:${item.checklistItemId}`);
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = pendingUpload.current;
    e.target.value = '';
    pendingUpload.current = null;
    setUploadingKey(null);
    if (!file || !target) return;

    try {
      const archivo = await createDocumentoFromFile(file);
      onUpload(target.etapaTipo, target.checklistItemId, archivo);
      notify({
        type: 'success',
        title: 'Archivo guardado',
        message: file.name
      });
    } catch (err) {
      notify({
        type: 'error',
        title: 'No se pudo subir',
        message: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm sm:rounded-3xl sm:p-0">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,image/*,application/pdf"
        onChange={handleFileChange}
      />

      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Archivos</p>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Documentos del trámite</h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Por fecha de carga. {conArchivo} con archivo · {pendientes} pendientes.
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(
            [
              ['todos', 'Todos'],
              ['con_archivo', 'Con archivo'],
              ['pendientes', 'Pendientes']
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltro(value)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${
                filtro === value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
          <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No hay documentos en este filtro.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const key = `${item.etapaTipo}:${item.checklistItemId}`;
            const src = getDocumentoSource(item.archivo);
            return (
              <li
                key={key}
                className="rounded-2xl border border-slate-100 p-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.etapaLabel}
                    {item.archivo
                      ? ` · ${item.archivo.nombre} · ${formatFechaDoc(item.archivo.fechaAnadido)}`
                      : item.requiereDocumento
                        ? ' · Sin archivo'
                        : ' · No requiere archivo'}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:flex-wrap">
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
                        <Eye className="mr-1 h-4 w-4" />
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
                        <Download className="mr-1 h-4 w-4" />
                        Bajar
                      </Button>
                    </>
                  )}
                  {item.requiereDocumento && (
                    <Button
                      size="sm"
                      variant={item.archivo ? 'outline' : 'primary'}
                      className="w-full sm:w-auto"
                      onClick={() => triggerUpload(item)}
                      disabled={uploadingKey === key}
                    >
                      {item.archivo ? (
                        <>
                          <Replace className="mr-1 h-4 w-4" />
                          Editar
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1 h-4 w-4" />
                          Subir
                        </>
                      )}
                    </Button>
                  )}
                  {item.archivo && (
                    <Button
                      size="sm"
                      variant="danger"
                      className="w-full sm:w-auto"
                      onClick={() => onRemove(item.etapaTipo, item.checklistItemId)}
                    >
                      <Trash2 className="mr-1 h-4 w-4 sm:mr-0" />
                      <span className="sm:hidden">Eliminar</span>
                    </Button>
                  )}
                  {!item.requiereDocumento && !item.archivo && (
                    <span className="col-span-2 inline-flex items-center justify-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-500">
                      <FilePlus2 className="h-3 w-3" />
                      Solo acción
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <DocumentoPreviewModal
        open={Boolean(preview)}
        archivo={preview?.archivo || null}
        titulo={preview?.titulo}
        onClose={() => setPreview(null)}
      />
    </div>
  );
};

export default ArchivosTramite;
