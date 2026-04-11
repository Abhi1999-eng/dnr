"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  '/dnr/page_06.png',
  '/dnr/page_10.png',
  '/dnr/page_12.png',
  '/dnr/page_16.png',
  '/dnr/page_18.png',
  '/dnr/page_19.png',
  '/dnr/page_20.png',
  '/dnr/page_22.png',
  '/dnr/page_23.png',
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(id);
  }, [paused]);

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-muted shadow-2xl min-h-[320px] bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index]}
            alt="DNR machinery"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-white/45 to-white/25" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute z-20 flex gap-2 left-1/2 -translate-x-1/2 bottom-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${i === index ? 'bg-primary' : 'bg-secondary/30'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-secondary rounded-full p-2 shadow"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-secondary rounded-full p-2 shadow"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
