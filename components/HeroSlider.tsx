"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductType } from '@/types';
import { ManagedImage } from './ManagedImage';
import { resolveProductImage } from '@/lib/media';

type Slide = {
  image: string;
  title: string;
  description: string;
  badge: string;
};

const fallbackSlides: Slide[] = [
  {
    image: '/dnr/page_06.png',
    title: 'Casting machinery',
    description: 'Support for die casting, moulding, and foundry-driven production environments.',
    badge: 'Casting systems',
  },
  {
    image: '/dnr/page_18.png',
    title: 'Precision CNC systems',
    description: 'Turning, milling, and production-support machinery for high-uptime operations.',
    badge: 'Machining support',
  },
  {
    image: '/dnr/page_22.png',
    title: 'Industrial automation',
    description: 'Marking, testing, polishing, and fabrication-ready equipment for modern plants.',
    badge: 'Automation range',
  },
];

const AUTOPLAY_INTERVAL = 3000;
const RESUME_DELAY = 5000;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const spotlightTags = ['Live product updates', 'Fast response', 'Plant-ready support'];

export function HeroSlider({ products = [] }: { products?: ProductType[] }) {
  const slides = useMemo<Slide[]>(() => {
    const productSlides = products
      .filter((product) => product.heroImage || product.image)
      .slice(0, 5)
      .map((product) => ({
        image: resolveProductImage(product),
        title: product.title,
        description:
          product.shortDescription ||
          product.description ||
          'Production-ready product support from DNR Techno Services.',
        badge: 'Machinery spotlight',
      }));

    return productSlides.length ? productSlides : fallbackSlides;
  }, [products]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion || slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [paused, prefersReducedMotion, slides.length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const activeIndex = slides.length ? index % slides.length : 0;
  const activeSlide = slides[activeIndex];

  function scheduleResume() {
    if (prefersReducedMotion) return;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setPaused(false);
      resumeTimerRef.current = null;
    }, RESUME_DELAY);
  }

  function pauseForInteraction() {
    setPaused(true);
    scheduleResume();
  }

  const goTo = (nextIndex: number, triggeredByUser = true) => {
    if (triggeredByUser) pauseForInteraction();
    setIndex((nextIndex + slides.length) % slides.length);
  };

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(246,248,250,0.98))] shadow-[0_18px_44px_rgba(15,23,42,0.10)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => scheduleResume()}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => scheduleResume()}
      onTouchStart={() => pauseForInteraction()}
    >
      <div className="grid h-[380px] max-h-[500px] grid-rows-[1.05fr_auto] overflow-hidden md:h-[430px] lg:h-[500px]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(139,197,63,0.16),transparent_46%),linear-gradient(180deg,#f8fafc,#eef3f7)] p-4 md:p-5">
          <ManagedImage
            key={activeSlide.image}
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            className="object-contain object-center p-3 md:p-5"
            sizes="(max-width: 1024px) 100vw, 44vw"
            quality={72}
            priority={activeIndex === 0}
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/70 to-transparent" />
        </div>

        <div className="relative z-10 space-y-4 border-t border-secondary/10 bg-white/96 px-5 py-4 backdrop-blur-sm md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary/80">
                {activeSlide.badge}
              </span>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold leading-tight text-secondary md:text-2xl">{activeSlide.title}</h2>
                <p className="line-clamp-3 max-w-xl text-sm leading-6 text-secondary/72">{activeSlide.description}</p>
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => goTo(activeIndex - 1)}
                  aria-label="Previous product spotlight"
                  className="touch-target rounded-full border border-secondary/10 bg-white text-secondary shadow-sm transition hover:border-primary/35 hover:text-primary"
                >
                  <ChevronLeft size={18} className="mx-auto" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(activeIndex + 1)}
                  aria-label="Next product spotlight"
                  className="touch-target rounded-full border border-secondary/10 bg-white text-secondary shadow-sm transition hover:border-primary/35 hover:text-primary"
                >
                  <ChevronRight size={18} className="mx-auto" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {spotlightTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-secondary/10 bg-slate-50 px-3 py-1 text-[11px] font-medium text-secondary/70 md:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {slides.length > 1 ? (
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous product spotlight"
                className="touch-target rounded-full border border-secondary/10 bg-white text-secondary shadow-sm transition hover:border-primary/35 hover:text-primary"
              >
                <ChevronLeft size={18} className="mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next product spotlight"
                className="touch-target rounded-full border border-secondary/10 bg-white text-secondary shadow-sm transition hover:border-primary/35 hover:text-primary"
              >
                <ChevronRight size={18} className="mx-auto" />
              </button>
              <div className="ml-auto flex gap-2">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={`${slide.title}-${slideIndex}`}
                    type="button"
                    onClick={() => goTo(slideIndex)}
                    className={`inline-flex items-center justify-center rounded-full transition-all ${slideIndex === activeIndex ? 'bg-primary/10' : 'bg-transparent hover:bg-secondary/10'}`}
                    aria-label={`Show ${slide.title}`}
                  >
                    <span className={`block h-2 rounded-full transition-all ${slideIndex === activeIndex ? 'w-7 bg-primary' : 'w-2 bg-secondary/35'}`} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
