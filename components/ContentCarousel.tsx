'use client';

import { Children, ReactNode, useEffect, useMemo, useState } from 'react';
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
};

export function ContentCarousel({
  children,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  viewportClassName = '',
}: ContentCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(itemsPerView.mobile ?? 1);
  const gapRem = 1.25;
  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerView));
  const maxStartIndex = Math.max(0, items.length - cardsPerView);
  const clampedActiveIndex = Math.min(activeIndex, maxStartIndex);
  const canPrev = clampedActiveIndex > 0;
  const canNext = clampedActiveIndex < maxStartIndex;
  const showControls = totalPages > 1;

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

  function move(direction: 1 | -1) {
    setActiveIndex((current) => {
      const next = current + direction * cardsPerView;
      return Math.max(0, Math.min(maxStartIndex, next));
    });
  }

  return (
    <div className="space-y-5">
      {showControls ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!canPrev}
            aria-label="Previous items"
            className="touch-target rounded-full border border-secondary/10 bg-white p-2 text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={!canNext}
            aria-label="Next items"
            className="touch-target rounded-full border border-secondary/10 bg-white p-2 text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      <div className={`overflow-hidden rounded-[28px] border border-secondary/10 bg-white/70 p-2 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ${viewportClassName}`}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: `${gapRem}rem`,
            transform: `translateX(calc(-${clampedActiveIndex} * ((100% - ${(cardsPerView - 1) * gapRem}rem) / ${cardsPerView} + ${gapRem}rem)))`,
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
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageStart = Math.min(pageIndex * cardsPerView, maxStartIndex);
            const isActive = clampedActiveIndex === pageStart;
            return (
              <button
                key={pageIndex}
                type="button"
                onClick={() => setActiveIndex(pageStart)}
                aria-label={`Go to slide group ${pageIndex + 1}`}
                className={`touch-target inline-flex items-center justify-center rounded-full transition-all ${isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-secondary/10'}`}
              >
                <span className={`block h-2.5 rounded-full transition-all ${isActive ? 'w-8 bg-primary' : 'w-2.5 bg-secondary/35'}`} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
