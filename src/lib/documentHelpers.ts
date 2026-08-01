import {
  ChecklistItem,
  DocumentoArchivo,
  DocumentoKind,
  TipoEtapa,
  Tramite
} from '../types/tramite';
import { getEtapaLabel } from '../data/tramitesCatalog';

export const MAX_DOC_BYTES = 1.5 * 1024 * 1024; // 1.5 MB por archivo en demo local

export interface DocumentoListItem {
  checklistItemId: string;
  label: string;
  etapaTipo: TipoEtapa;
  etapaLabel: string;
  requiereDocumento: boolean;
  completado: boolean;
  archivo?: DocumentoArchivo;
}

export const isDriveUrl = (url?: string): boolean =>
  Boolean(url && /drive\.google\.com/i.test(url));

export const isDriveFolderUrl = (url?: string): boolean =>
  Boolean(url && /drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/)/i.test(url));

/** Heurística: carpetas Drive usan /folders/ */
export const detectDocumentoKindFromUrl = (url: string): DocumentoKind => {
  if (isDriveFolderUrl(url)) return 'carpeta';
  if (isDriveUrl(url)) return 'archivo';
  return 'enlace';
};

export const mimeForKind = (kind: DocumentoKind): string => {
  if (kind === 'carpeta') return 'application/vnd.google-apps.folder';
  if (kind === 'enlace') return 'text/uri-list';
  return 'application/pdf';
};

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });

export const createDocumentoFromFile = async (file: File): Promise<DocumentoArchivo> => {
  if (file.size > MAX_DOC_BYTES) {
    throw new Error(`El archivo supera ${Math.round(MAX_DOC_BYTES / 1024 / 1024 * 10) / 10} MB. Usa un archivo más liviano en modo demo.`);
  }
  const dataUrl = await fileToDataUrl(file);
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nombre: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    fechaAnadido: new Date().toISOString(),
    dataUrl
  };
};

export const createDocumentoFromUrl = (
  nombre: string,
  urlExterna: string,
  opts?: { mimeType?: string; kind?: DocumentoKind }
): DocumentoArchivo => {
  const kind = opts?.kind || detectDocumentoKindFromUrl(urlExterna);
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nombre,
    mimeType: opts?.mimeType || mimeForKind(kind),
    size: 0,
    fechaAnadido: new Date().toISOString(),
    urlExterna,
    kind
  };
};

export const createDocumentoCarpeta = (
  nombre: string,
  urlExterna?: string
): DocumentoArchivo => ({
  id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nombre,
  mimeType: mimeForKind('carpeta'),
  size: 0,
  fechaAnadido: new Date().toISOString(),
  urlExterna: urlExterna || undefined,
  kind: 'carpeta'
});

export const getDocumentoSource = (archivo?: DocumentoArchivo): string | null => {
  if (!archivo) return null;
  return archivo.dataUrl || archivo.urlExterna || null;
};

export const getDocumentoKind = (archivo?: DocumentoArchivo): DocumentoKind => {
  if (!archivo) return 'archivo';
  if (archivo.kind) return archivo.kind;
  if (archivo.urlExterna) return detectDocumentoKindFromUrl(archivo.urlExterna);
  return 'archivo';
};

export const formatBytes = (bytes: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatFechaDoc = (iso: string): string => {
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

export const isPreviewableImage = (mime?: string) => Boolean(mime?.startsWith('image/'));
export const isPreviewablePdf = (mime?: string) => mime === 'application/pdf';

export const listDocumentosTramite = (tramite: Tramite): DocumentoListItem[] => {
  const items: DocumentoListItem[] = [];
  for (const etapa of tramite.etapas) {
    if (etapa.estado === 'no_aplica') continue;
    for (const item of etapa.checklist) {
      items.push({
        checklistItemId: item.id,
        label: item.label,
        etapaTipo: etapa.tipo,
        etapaLabel: getEtapaLabel(etapa.tipo),
        requiereDocumento: item.requiereDocumento ?? false,
        completado: item.completado,
        archivo: item.archivo
      });
    }
  }

  return items.sort((a, b) => {
    const da = a.archivo?.fechaAnadido ? new Date(a.archivo.fechaAnadido).getTime() : 0;
    const db = b.archivo?.fechaAnadido ? new Date(b.archivo.fechaAnadido).getTime() : 0;
    if (da !== db) return db - da;
    return a.label.localeCompare(b.label, 'es');
  });
};

export const upsertChecklistArchivo = (
  checklist: ChecklistItem[],
  itemId: string,
  archivo: DocumentoArchivo | undefined,
  meta?: { label?: string }
): ChecklistItem[] => {
  const exists = checklist.some((item) => item.id === itemId);
  if (!exists) {
    if (!archivo) return checklist;
    return [
      ...checklist,
      {
        id: itemId,
        label: meta?.label || archivo.nombre,
        completado: true,
        requiereDocumento: true,
        archivo
      }
    ];
  }
  return checklist.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      label: meta?.label || item.label,
      archivo,
      completado: archivo ? true : item.requiereDocumento ? false : item.completado
    };
  });
};

export const newChecklistItemId = (prefix = 'doc') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
