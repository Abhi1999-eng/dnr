'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ManagedImage } from '@/components/ManagedImage';

const ProductImageLightbox = dynamic(() => import('@/components/ProductImageLightbox').then((mod) => mod.ProductImageLightbox), {
  ssr: false,
});

type ProductDetailGalleryProps = {
  title: string;
  heroImage: string;
  galleryImages?: string[];
  theme?: 'light' | 'dark';
};

export function ProductDetailGallery({ title, heroImage, galleryImages = [], theme = 'light' }: ProductDetailGalleryProps) {
  const isDark = theme === 'dark';
  const images = useMemo(() => {
    const seen = new Set<string>();
    return [heroImage, ...galleryImages].filter((image) => {
      if (!image || seen.has(image)) return false;
      seen.add(image);
      return true;
    });
  }, [galleryImages, heroImage]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  function openAt(index: number) {
    setActiveIndex(index);
    setIsOpen(true);
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openAt(0)}
          className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl p-4 transition md:aspect-[5/4] md:p-6 ${
            isDark
              ? 'border border-white/10 bg-[#0b1218] hover:border-[#7ed321]/30 hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)]'
              : 'border border-muted/80 bg-slate-50 hover:border-primary/30 hover:shadow-md'
          }`}
          aria-label={`Open ${title} image gallery`}
        >
          <ManagedImage
            src={heroImage}
            alt={title}
            width={1600}
            height={1200}
            className="max-h-full max-w-full object-contain object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </button>

        {images.length > 1 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => openAt(index)}
                className={`relative h-28 overflow-hidden rounded-xl border p-2 transition ${
                  isDark
                    ? index === activeIndex && isOpen
                      ? 'border-[#7ed321]/45 bg-white/[0.05] shadow-[0_0_0_1px_rgba(126,211,33,0.32)]'
                      : 'border-white/10 bg-[#111b24] hover:border-[#7ed321]/30 hover:shadow-[0_12px_26px_rgba(0,0,0,0.18)]'
                    : index === activeIndex && isOpen
                      ? 'border-primary/50 bg-white'
                      : 'border-muted/80 bg-white hover:border-primary/35 hover:shadow-sm'
                }`}
                aria-label={`Open ${title} image ${index + 1}`}
              >
                <ManagedImage src={img} alt={`${title} gallery image ${index + 1}`} fill className="object-contain object-center p-2" sizes="(max-width: 768px) 33vw, 160px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ProductImageLightbox isOpen={isOpen} images={images} title={title} activeIndex={activeIndex} onClose={() => setIsOpen(false)} onChange={setActiveIndex} />
    </>
  );
}
