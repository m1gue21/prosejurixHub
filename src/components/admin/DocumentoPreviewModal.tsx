import { Download, Eye, FileText, Image as ImageIcon, X } from 'lucide-react';
import Button from '../common/Button';
import {
  formatBytes,
  formatFechaDoc,
  getDocumentoSource,
  isPreviewableImage,
  isPreviewablePdf
} from '../../lib/documentHelpers';
import { DocumentoArchivo } from '../../types/tramite';

interface DocumentoPreviewModalProps {
  open: boolean;
  archivo: DocumentoArchivo | null;
  titulo?: string;
  onClose: () => void;
}

const DocumentoPreviewModal = ({ open, archivo, titulo, onClose }: DocumentoPreviewModalProps) => {
  if (!open || !archivo) return null;

  const src = getDocumentoSource(archivo);
  const canImage = isPreviewableImage(archivo.mimeType);
  const canPdf = isPreviewablePdf(archivo.mimeType);

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = archivo.nombre;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/70 sm:items-center sm:px-4 sm:py-6">
      <div className="flex h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[90vh] sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400 sm:text-xs">
              {titulo || 'Vista previa'}
            </p>
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              {archivo.nombre}
            </h3>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              {archivo.mimeType} · {formatBytes(archivo.size)} · {formatFechaDoc(archivo.fechaAnadido)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {src && (
              <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3 sm:p-4">
          {!src && (
            <div className="flex h-64 flex-col items-center justify-center text-slate-500">
              <FileText className="mb-2 h-10 w-10" />
              <p>No hay contenido para previsualizar.</p>
            </div>
          )}
          {src && canImage && (
            <img
              src={src}
              alt={archivo.nombre}
              className="mx-auto max-h-full max-w-full rounded-xl object-contain shadow"
            />
          )}
          {src && canPdf && (
            <iframe
              title={archivo.nombre}
              src={src}
              className="h-full min-h-[60vh] w-full rounded-xl border border-slate-200 bg-white"
            />
          )}
          {src && !canImage && !canPdf && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-600">
              <ImageIcon className="h-10 w-10 text-slate-400" />
              <p className="px-4 text-center text-sm">Este tipo de archivo no se puede previsualizar aquí.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
                {archivo.urlExterna && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(archivo.urlExterna, '_blank', 'noopener,noreferrer')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Abrir enlace
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {src && (
          <div className="shrink-0 border-t border-slate-200 p-3 safe-pb sm:hidden">
            <Button className="w-full" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentoPreviewModal;
