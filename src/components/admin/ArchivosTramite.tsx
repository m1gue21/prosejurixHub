import { useMemo, useRef, useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Link2,
  Replace,
  Trash2,
  Upload
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import DocumentoPreviewModal from './DocumentoPreviewModal';
import {
  DocumentoListItem,
  createDocumentoCarpeta,
  createDocumentoFromFile,
  createDocumentoFromUrl,
  formatBytes,
  formatFechaDoc,
  getDocumentoKind,
  getDocumentoSource,
  listDocumentosTramite,
  newChecklistItemId
} from '../../lib/documentHelpers';
import { getEtapaLabel } from '../../data/tramitesCatalog';
import { DocumentoArchivo, TipoEtapa, Tramite } from '../../types/tramite';
import { useNotifications } from '../common/NotificationProvider';

interface ArchivosTramiteProps {
  tramite: Tramite;
  onUpload: (
    etapaTipo: TipoEtapa,
    checklistItemId: string,
    archivo: DocumentoArchivo,
    meta?: { label?: string }
  ) => void;
  onRemove: (etapaTipo: TipoEtapa, checklistItemId: string) => void;
}

type AddMode = 'archivo' | 'enlace' | 'carpeta';

const ETAPA_OPTIONS: TipoEtapa[] = [
  'vinculacion',
  'liberacion_vehiculos',
  'accion_penal',
  'medico_clinico',
  'medico_legal',
  'reclamacion_aseguradora',
  'medico_laboral',
  'conciliacion_prejudicial',
  'proceso_judicial'
];

const kindBadge = (archivo?: DocumentoArchivo) => {
  const kind = getDocumentoKind(archivo);
  if (kind === 'carpeta') return { label: 'Carpeta', className: 'bg-amber-100 text-amber-800' };
  if (kind === 'enlace' || archivo?.urlExterna) {
    return { label: 'Enlace', className: 'bg-sky-100 text-sky-800' };
  }
  return { label: 'Archivo', className: 'bg-slate-100 text-slate-600' };
};

const ArchivosTramite = ({ tramite, onUpload, onRemove }: ArchivosTramiteProps) => {
  const { notify } = useNotifications();
  const [filtro, setFiltro] = useState<'todos' | 'con_archivo' | 'pendientes'>('todos');
  const [preview, setPreview] = useState<{ archivo: DocumentoArchivo; titulo: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('enlace');
  const [addEtapa, setAddEtapa] = useState<TipoEtapa>(tramite.etapaActual || 'accion_penal');
  const [addNombre, setAddNombre] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addSlot, setAddSlot] = useState<string>('__nuevo__');
  const [linkTarget, setLinkTarget] = useState<DocumentoListItem | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const pendingUpload = useRef<{ etapaTipo: TipoEtapa; checklistItemId: string } | null>(null);

  const docs = useMemo(() => listDocumentosTramite(tramite), [tramite]);

  const slotsForEtapa = useMemo(
    () =>
      docs.filter(
        (d) => d.etapaTipo === addEtapa && d.requiereDocumento && !d.archivo
      ),
    [docs, addEtapa]
  );

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

  const openAdd = (mode: AddMode = 'enlace') => {
    setAddMode(mode);
    setAddEtapa(tramite.etapaActual || 'accion_penal');
    setAddNombre('');
    setAddUrl('');
    setAddSlot('__nuevo__');
    setShowAdd(true);
  };

  const submitAdd = async () => {
    const nombre = addNombre.trim() || (addMode === 'carpeta' ? 'Carpeta Drive' : 'Documento');
    const itemId =
      addSlot !== '__nuevo__' ? addSlot : newChecklistItemId(addMode === 'carpeta' ? 'folder' : 'link');

    try {
      if (addMode === 'archivo') {
        addFileRef.current?.click();
        return;
      }

      if (addMode === 'carpeta') {
        const url = addUrl.trim();
        if (!url && !addNombre.trim()) {
          notify({ type: 'error', title: 'Falta nombre o enlace', message: 'Indica al menos un nombre' });
          return;
        }
        const archivo = createDocumentoCarpeta(nombre, url || undefined);
        onUpload(addEtapa, itemId, archivo, { label: nombre });
        notify({ type: 'success', title: 'Carpeta añadida', message: nombre });
        setShowAdd(false);
        return;
      }

      const url = addUrl.trim();
      if (!url) {
        notify({ type: 'error', title: 'Falta el enlace', message: 'Pega la URL de Drive u otro archivo' });
        return;
      }
      const archivo = createDocumentoFromUrl(nombre, url);
      onUpload(addEtapa, itemId, archivo, { label: nombre });
      notify({ type: 'success', title: 'Enlace añadido', message: nombre });
      setShowAdd(false);
    } catch (err) {
      notify({
        type: 'error',
        title: 'No se pudo añadir',
        message: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  };

  const handleAddFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const itemId =
      addSlot !== '__nuevo__' ? addSlot : newChecklistItemId('file');
    try {
      const archivo = await createDocumentoFromFile(file);
      onUpload(addEtapa, itemId, archivo, { label: addNombre.trim() || file.name });
      notify({ type: 'success', title: 'Archivo guardado', message: file.name });
      setShowAdd(false);
    } catch (err) {
      notify({
        type: 'error',
        title: 'No se pudo subir',
        message: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  };

  const submitLinkToSlot = () => {
    if (!linkTarget) return;
    const url = linkUrl.trim();
    if (!url) {
      notify({ type: 'error', title: 'Falta el enlace', message: 'Pega una URL válida' });
      return;
    }
    const archivo = createDocumentoFromUrl(linkTarget.label, url);
    onUpload(linkTarget.etapaTipo, linkTarget.checklistItemId, archivo);
    notify({ type: 'success', title: 'Enlace guardado', message: linkTarget.label });
    setLinkTarget(null);
    setLinkUrl('');
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
      <input
        ref={addFileRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,image/*,application/pdf"
        onChange={handleAddFilePick}
      />

      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Archivos</p>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Documentos del trámite</h3>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Archivos, enlaces Drive y carpetas. {conArchivo} con recurso · {pendientes} pendientes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => openAdd('enlace')}>
            <Link2 className="h-4 w-4" />
            Añadir enlace
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAdd('carpeta')}>
            <FolderPlus className="h-4 w-4" />
            Carpeta
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAdd('archivo')}>
            <Upload className="h-4 w-4" />
            Subir
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-500">
          <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No hay documentos en este filtro.
          <div className="mt-4 flex justify-center">
            <Button size="sm" onClick={() => openAdd('enlace')}>
              Añadir el primero
            </Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const key = `${item.etapaTipo}:${item.checklistItemId}`;
            const src = getDocumentoSource(item.archivo);
            const kind = item.archivo ? kindBadge(item.archivo) : null;
            const isCarpeta = getDocumentoKind(item.archivo) === 'carpeta';
            return (
              <li
                key={key}
                className="rounded-2xl border border-slate-100 p-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    {kind && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${kind.className}`}
                      >
                        {isCarpeta ? <Folder className="h-3 w-3" /> : null}
                        {kind.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{item.etapaLabel}</p>
                  {item.archivo && src ? (
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
                      title="Abrir"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.archivo.nombre}</span>
                    </a>
                  ) : item.archivo && isCarpeta ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-amber-800">
                      <Folder className="h-3.5 w-3.5" />
                      {item.archivo.nombre}
                      <span className="text-xs text-slate-400">(sin enlace)</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">
                      {item.requiereDocumento ? 'Sin archivo ni enlace' : 'No requiere archivo'}
                    </p>
                  )}
                  {item.archivo && (
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {formatFechaDoc(item.archivo.fechaAnadido)}
                      {item.archivo.size > 0 ? ` · ${formatBytes(item.archivo.size)}` : ''}
                    </p>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:flex-wrap">
                  {item.archivo && src && (
                    <>
                      {!isCarpeta && item.archivo.dataUrl && (
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
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          if (src.startsWith('data:')) {
                            const a = document.createElement('a');
                            a.href = src;
                            a.download = item.archivo!.nombre;
                            a.click();
                          } else {
                            window.open(src, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        {item.archivo.urlExterna ? (
                          <>
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Abrir
                          </>
                        ) : (
                          <>
                            <Download className="mr-1 h-4 w-4" />
                            Bajar
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {item.requiereDocumento && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setLinkTarget(item);
                          setLinkUrl(item.archivo?.urlExterna || '');
                        }}
                      >
                        <Link2 className="mr-1 h-4 w-4" />
                        Enlace
                      </Button>
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
                            Subir
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1 h-4 w-4" />
                            Subir
                          </>
                        )}
                      </Button>
                    </>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Añadir a Archivos">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['enlace', 'Enlace archivo', Link2],
                ['carpeta', 'Carpeta', FolderPlus],
                ['archivo', 'Subir archivo', Upload]
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setAddMode(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium ${
                  addMode === id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Etapa</span>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={addEtapa}
              onChange={(e) => {
                setAddEtapa(e.target.value as TipoEtapa);
                setAddSlot('__nuevo__');
              }}
            >
              {ETAPA_OPTIONS.filter((t) => {
                const etapa = tramite.etapas.find((e) => e.tipo === t);
                return etapa && etapa.estado !== 'no_aplica';
              }).map((t) => (
                <option key={t} value={t}>
                  {getEtapaLabel(t)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Casilla del checklist</span>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              value={addSlot}
              onChange={(e) => setAddSlot(e.target.value)}
            >
              <option value="__nuevo__">Nueva (documento extra)</option>
              {slotsForEtapa.map((s) => (
                <option key={s.checklistItemId} value={s.checklistItemId}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Nombre</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder={
                addMode === 'carpeta' ? 'Ej. Carpeta expediente' : 'Ej. Denuncia Drive'
              }
              value={addNombre}
              onChange={(e) => setAddNombre(e.target.value)}
            />
          </label>

          {addMode !== 'archivo' && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                {addMode === 'carpeta' ? 'Enlace a carpeta (opcional)' : 'Enlace (Drive u otro)'}
              </span>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                placeholder="https://drive.google.com/..."
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
              />
            </label>
          )}

          {addMode === 'archivo' && (
            <p className="text-sm text-slate-500">
              Al confirmar se abrirá el selector de archivos de tu equipo.
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void submitAdd()}>
              {addMode === 'archivo' ? 'Elegir archivo' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(linkTarget)}
        onClose={() => {
          setLinkTarget(null);
          setLinkUrl('');
        }}
        title="Pegar enlace Drive"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Casilla: <strong>{linkTarget?.label}</strong> · {linkTarget?.etapaLabel}
          </p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">URL</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder="https://drive.google.com/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
            />
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setLinkTarget(null);
                setLinkUrl('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={submitLinkToSlot}>Guardar enlace</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ArchivosTramite;
