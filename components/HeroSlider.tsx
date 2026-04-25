"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductType } from '@/types';

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

export function HeroSlider({ products = [] }: { products?: ProductType[] }) {
  const slides = useMemo<Slide[]>(() => {
    const productSlides = products
      .filter((product) => product.heroImage || product.image)
      .slice(0, 5)
      .map((product) => ({
        image: product.heroImage || product.image || '/dnr/page_06.png',
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

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const activeIndex = slides.length ? index % slides.length : 0;
  const activeSlide = slides[activeIndex];
  const goTo = (nextIndex: number) => setIndex((nextIndex + slides.length) % slides.length);

  return (
    <div
      className="relative rounded-[30px] border border-secondary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.92))] p-4 shadow-[0_28px_70px_rgba(15,23,42,0.16)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[450px] overflow-hidden rounded-[24px] border border-secondary/10 bg-secondary">
        <div className="absolute inset-0 transition-opacity duration-500 ease-out">
          <Image
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 45vw"
            quality={72}
            priority={activeIndex === 0}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(15,23,42,0.42)_52%,rgba(15,23,42,0.18))]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full min-h-[450px] flex-col justify-between p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                Machinery range
              </span>
              <div className="hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-white/80 shadow-lg shadow-black/10 backdrop-blur-sm md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live product surface</p>
                <p className="mt-1 text-sm leading-relaxed">Every product added in admin appears here automatically, so the hero stays current without extra setup.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous slide"
                className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white hover:text-secondary"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next slide"
                className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white hover:text-secondary"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="max-w-lg space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Precision machinery • support-ready</p>
              <h3 className="text-2xl font-semibold leading-tight text-white md:text-3xl">{activeSlide.title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-base">{activeSlide.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-semibold text-white">Live</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Product updates</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-semibold text-white">Fast</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Service response</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-semibold text-white">Plant</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Ready support</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={`${slide.title}-${slideIndex}`}
                onClick={() => goTo(slideIndex)}
                className={`h-2.5 rounded-full transition-all ${slideIndex === activeIndex ? 'w-10 bg-primary' : 'w-2.5 bg-white/35 hover:bg-white/70'}`}
                aria-label={`Show ${slide.title}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-10 bottom-0 h-10 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}
