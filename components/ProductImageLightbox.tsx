'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { ManagedImage } from '@/components/ManagedImage';

type ProductImageLightboxProps = {
  isOpen: boolean;
  images: string[];
  title: string;
  activeIndex: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function ProductImageLightbox({ isOpen, images, title, activeIndex, onClose, onChange }: ProductImageLightboxProps) {
  const prefersReducedMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);
  const hasMultipleImages = images.length > 1;
  const normalizedIndex = useMemo(() => {
    if (!images.length) return 0;
    return ((activeIndex % images.length) + images.length) % images.length;
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (!hasMultipleImages) return;
      if (event.key === 'ArrowRight') onChange((normalizedIndex + 1) % images.length);
      if (event.key === 'ArrowLeft') onChange((normalizedIndex - 1 + images.length) % images.length);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMultipleImages, images.length, isOpen, normalizedIndex, onChange, onClose]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[normalizedIndex];

  function showPrev() {
    if (!hasMultipleImages) return;
    onChange((normalizedIndex - 1 + images.length) % images.length);
  }

  function showNext() {
    if (!hasMultipleImages) return;
    onChange((normalizedIndex + 1) % images.length);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 48) return;
    if (deltaX < 0) showNext();
    else showPrev();
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close image gallery"
        />

        <motion.div
          className="relative z-10 flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] shadow-[0_32px_90px_rgba(15,23,42,0.38)]"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: 12 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image gallery`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Product gallery</p>
              <p className="truncate text-sm font-medium text-white/88 md:text-base">{title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close gallery"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-5">
            <div className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,197,63,0.10),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 md:min-h-[520px] md:p-6">
              {hasMultipleImages ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/75 text-white/80 shadow-lg transition hover:bg-slate-800 hover:text-white md:left-4"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : null}

              <div className="flex h-full w-full items-center justify-center" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <ManagedImage
                  key={currentImage}
                  src={currentImage}
                  alt={`${title} image ${normalizedIndex + 1}`}
                  width={1800}
                  height={1400}
                  className="max-h-[68vh] w-auto max-w-full object-contain object-center"
                  priority
                />
              </div>

              {hasMultipleImages ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/75 text-white/80 shadow-lg transition hover:bg-slate-800 hover:text-white md:right-4"
                >
                  <ChevronRight size={20} />
                </button>
              ) : null}
            </div>

            {hasMultipleImages ? (
              <div className="grid grid-cols-4 gap-2 overflow-x-auto pb-1 sm:grid-cols-5 lg:grid-cols-6">
                {images.map((image, index) => {
                  const isActive = index === normalizedIndex;
                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => onChange(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`relative flex h-20 min-w-0 items-center justify-center overflow-hidden rounded-2xl border p-1 transition ${
                        isActive ? 'border-primary bg-white/10 shadow-[0_0_0_1px_rgba(139,197,63,0.4)]' : 'border-white/10 bg-white/[0.04] hover:border-white/30'
                      }`}
                    >
                      <ManagedImage key={image} src={image} alt={`${title} thumbnail ${index + 1}`} fill className="object-contain object-center p-2" sizes="120px" />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
