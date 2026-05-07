'use client';

import { Children, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ContentCarouselProps = {
  children: ReactNode;
  itemsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  viewportClassName?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  advanceBy?: number;
  controlsMode?: 'full' | 'arrows' | 'none';
  gapRem?: number;
};

const AUTOPLAY_INTERVAL = 3000;
const RESUME_DELAY = 5000;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function ContentCarousel({
  children,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  viewportClassName = '',
  autoPlay = true,
  autoPlayInterval = AUTOPLAY_INTERVAL,
  advanceBy,
  controlsMode = 'full',
  gapRem = 1.25,
}: ContentCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(itemsPerView.mobile ?? 1);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxStartIndex = Math.max(0, items.length - cardsPerView);
  const clampedActiveIndex = Math.min(activeIndex, maxStartIndex);
  const step = Math.max(1, advanceBy ?? cardsPerView);
  const totalPages = Math.max(1, Math.ceil((maxStartIndex + 1) / step));
  const canNavigate = maxStartIndex > 0;
  const showDots = controlsMode === 'full' && totalPages > 1;
  const showArrows = controlsMode !== 'none' && canNavigate;
  const showControls = showDots || showArrows;

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      const nextCardsPerView =
        width >= 1280
          ? itemsPerView.wide ?? itemsPerView.desktop ?? itemsPerView.tablet ?? itemsPerView.mobile ?? 1
          : width >= 1024
            ? itemsPerView.desktop ?? itemsPerView.tablet ?? itemsPerView.mobile ?? 1
            : width >= 768
              ? itemsPerView.tablet ?? itemsPerView.mobile ?? 1
              : itemsPerView.mobile ?? 1;
      setCardsPerView(Math.max(1, nextCardsPerView));
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, [itemsPerView.desktop, itemsPerView.mobile, itemsPerView.tablet, itemsPerView.wide]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);


  useEffect(() => {
    if (!autoPlay || prefersReducedMotion || isPaused || !canNavigate) return;

    const id = setInterval(() => {
      setActiveIndex((current) => {
        const normalizedCurrent = Math.min(current, maxStartIndex);
        const next = normalizedCurrent + step;
        return next > maxStartIndex ? 0 : next;
      });
    }, autoPlayInterval);

    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval, canNavigate, isPaused, maxStartIndex, prefersReducedMotion, step]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  function scheduleAutoplayResume() {
    if (!autoPlay || prefersReducedMotion) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      resumeTimerRef.current = null;
    }, RESUME_DELAY);
  }

  function pauseForInteraction() {
    setIsPaused(true);
    scheduleAutoplayResume();
  }

  function move(direction: 1 | -1, triggeredByUser = true) {
    if (!canNavigate) return;
    if (triggeredByUser) pauseForInteraction();
    setActiveIndex((current) => {
      const normalizedCurrent = Math.min(current, maxStartIndex);

      if (direction === 1) {
        const next = normalizedCurrent + step;
        return next > maxStartIndex ? 0 : next;
      }

      const prev = normalizedCurrent - step;
      return prev < 0 ? maxStartIndex : prev;
    });
  }

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => scheduleAutoplayResume()}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => scheduleAutoplayResume()}
      onTouchStart={() => pauseForInteraction()}
    >
      <div className={`overflow-hidden rounded-[28px] border border-secondary/10 bg-white/70 p-2 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ${viewportClassName}`}>
        <div
          className="flex will-change-transform"
          style={{
            gap: `${gapRem}rem`,
            transform: `translate3d(calc(-${clampedActiveIndex} * ((100% - ${(cardsPerView - 1) * gapRem}rem) / ${cardsPerView} + ${gapRem}rem)), 0, 0)`,
            transitionDuration: prefersReducedMotion ? '0ms' : '820ms',
            transitionTimingFunction: EASING,
            transitionProperty: 'transform',
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="min-w-0"
              style={{
                flex: `0 0 calc((100% - ${(cardsPerView - 1) * gapRem}rem) / ${cardsPerView})`,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {showControls ? (
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="order-2 flex items-center justify-center gap-2 sm:order-1 sm:justify-start">
            {showDots ? Array.from({ length: totalPages }).map((_, pageIndex) => {
              const pageStart = Math.min(pageIndex * step, maxStartIndex);
              const isActive = clampedActiveIndex === pageStart;
              return (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => {
                    pauseForInteraction();
                    setActiveIndex(pageStart);
                  }}
                  aria-label={`Go to slide group ${pageIndex + 1}`}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full transition-all ${isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-secondary/10'}`}
              >
                  <span className={`block h-2.5 rounded-full transition-all ${isActive ? 'w-8 bg-primary' : 'w-2.5 bg-secondary/35'}`} />
                </button>
              );
            }) : null}
          </div>

          {showArrows ? (
            <div className="order-1 flex items-center justify-center gap-2 sm:order-2 sm:justify-end">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous items"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary/10 bg-white text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next items"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary/10 bg-white text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
