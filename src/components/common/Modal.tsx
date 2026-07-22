import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
      <div className="flex h-[95dvh] w-full max-w-5xl flex-col sm:h-auto sm:max-h-[90vh]">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] bg-gradient-to-br from-slate-200 via-white to-slate-100 p-[1px] shadow-2xl shadow-slate-900/25 sm:rounded-[30px]">
          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[23px] bg-white sm:rounded-[28px] ${className}`}
          >
            {title && (
              <div className="sticky top-0 z-10 shrink-0 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h3>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                      aria-label="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 safe-pb sm:px-6 sm:py-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
