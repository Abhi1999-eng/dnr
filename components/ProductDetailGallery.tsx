'use client';

import { useMemo, useState } from 'react';
import { ManagedImage } from '@/components/ManagedImage';
import { ProductImageLightbox } from '@/components/ProductImageLightbox';

type ProductDetailGalleryProps = {
  title: string;
  heroImage: string;
  galleryImages?: string[];
};

export function ProductDetailGallery({ title, heroImage, galleryImages = [] }: ProductDetailGalleryProps) {
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
          className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-muted/80 bg-slate-50 p-4 transition hover:border-primary/30 hover:shadow-md md:aspect-[5/4] md:p-6"
          aria-label={`Open ${title} image gallery`}
        >
          <ManagedImage
            src={heroImage}
            alt={title}
            width={1600}
            height={1200}
            className="max-h-full max-w-full object-contain object-center"
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
                className={`relative h-28 overflow-hidden rounded-xl border bg-white p-2 transition hover:border-primary/35 hover:shadow-sm ${
                  index === activeIndex && isOpen ? 'border-primary/50' : 'border-muted/80'
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
