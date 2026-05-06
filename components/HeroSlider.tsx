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
};

const fallbackSlides: Slide[] = [
  {
    image: '/dnr/page_06.png',
    title: 'Casting machinery',
    description: 'Support for die casting, moulding, and foundry-driven production environments.',
  },
  {
    image: '/dnr/page_18.png',
    title: 'Precision CNC systems',
    description: 'Turning, milling, and production-support machinery for high-uptime operations.',
  },
  {
    image: '/dnr/page_22.png',
    title: 'Industrial automation',
    description: 'Marking, testing, polishing, and fabrication-ready equipment for modern plants.',
  },
];

const AUTOPLAY_INTERVAL = 3000;
const RESUME_DELAY = 5000;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

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
      className="relative rounded-[26px] border border-secondary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92))] p-3 shadow-[0_22px_56px_rgba(15,23,42,0.14)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => scheduleResume()}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => scheduleResume()}
      onTouchStart={() => pauseForInteraction()}
    >
      <div className="relative min-h-[380px] overflow-hidden rounded-[22px] border border-secondary/10 bg-secondary">
        <div
          className="absolute inset-0 will-change-opacity"
          style={{
            transitionDuration: prefersReducedMotion ? '0ms' : '820ms',
            transitionTimingFunction: EASING,
            transitionProperty: 'opacity',
          }}
        >
          <div className="absolute inset-0 bg-slate-100" />
          <ManagedImage
            key={activeSlide.image}
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            className="object-contain object-center p-4 md:p-5"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 45vw"
            quality={72}
            priority={activeIndex === 0}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(15,23,42,0.42)_48%,rgba(15,23,42,0.22))]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full min-h-[380px] flex-col justify-between p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2.5">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
                Machinery range
              </span>
              <div className="hidden rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-left text-white/80 shadow-lg shadow-black/10 backdrop-blur-sm md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live product surface</p>
                <p className="mt-1 text-[13px] leading-relaxed">Every product added in admin appears here automatically, so the hero stays current without extra setup.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous slide"
                className="touch-target rounded-full border border-white/25 bg-white/15 p-2 text-white transition hover:bg-white hover:text-secondary"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next slide"
                className="touch-target rounded-full border border-white/25 bg-white/15 p-2 text-white transition hover:bg-white hover:text-secondary"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="max-w-lg space-y-3">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Precision machinery • support-ready</p>
              <p className="text-[1.65rem] font-semibold leading-tight text-white md:text-[2.1rem]">{activeSlide.title}</p>
              <p className="max-w-md text-[13px] leading-relaxed text-white/90 md:text-base">{activeSlide.description}</p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">Live</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/85">Product updates</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">Fast</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/85">Service response</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <p className="text-xl font-semibold text-white">Plant</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/85">Ready support</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={`${slide.title}-${slideIndex}`}
                type="button"
                onClick={() => goTo(slideIndex)}
                className={`touch-target inline-flex items-center justify-center rounded-full transition-all ${slideIndex === activeIndex ? 'bg-white/10' : 'bg-transparent hover:bg-white/10'}`}
                aria-label={`Show ${slide.title}`}
              >
                <span className={`block h-2.5 rounded-full transition-all ${slideIndex === activeIndex ? 'w-10 bg-primary' : 'w-2.5 bg-white/70'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-10 bottom-0 h-10 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}
