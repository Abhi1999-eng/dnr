'use client';

import { ReactNode, useEffect } from 'react';

type AdminEditModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function AdminEditModal({ open, title, description, onClose, children }: AdminEditModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="glass max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[28px] border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white transition hover:bg-white/10"
            aria-label="Close edit dialog"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
