'use client';

import { Children, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ContentCarouselProps = {
  children: ReactNode;
  itemClassName?: string;
  viewportClassName?: string;
};

export function ContentCarousel({
  children,
  itemClassName = 'auto-cols-[88%] sm:auto-cols-[65%] lg:auto-cols-[38%] xl:auto-cols-[32%]',
  viewportClassName = '',
}: ContentCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(items.length > 1);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateButtons = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth - 4;
      setCanPrev(viewport.scrollLeft > 4);
      setCanNext(viewport.scrollLeft < maxScroll);
    };

    updateButtons();
    viewport.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    return () => {
      viewport.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
    };
  }, [items.length]);

  function scrollByPage(direction: 1 | -1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: direction * Math.max(viewport.clientWidth * 0.85, 280), behavior: 'smooth' });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          disabled={!canPrev}
          aria-label="Previous items"
          className="rounded-full border border-secondary/10 bg-white p-2 text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          disabled={!canNext}
          aria-label="Next items"
          className="rounded-full border border-secondary/10 bg-white p-2 text-secondary shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={viewportRef}
        className={`overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${viewportClassName}`}
      >
        <div className={`grid grid-flow-col gap-5 pb-1 ${itemClassName}`}>
          {items.map((item, index) => (
            <div key={index} className="min-w-0 snap-start">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
