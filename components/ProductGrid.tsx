"use client";

import Image from 'next/image';
import { useState } from 'react';
import { SectionTitle } from './SectionTitle';
import { ProductModal } from './ProductModal';
import { ContentCarousel } from './ContentCarousel';
import type { ProductType } from '@/types';

export function ProductGrid({
  products,
  id = 'products',
  title = 'Products we support',
  kicker = 'Production-ready machinery and engineering support for casting, machining, fabrication, automation, and testing lines.',
  showTitle = true,
  embedded = false,
  enableModal = false,
  emptyTitle = 'No products added yet',
  emptyDescription = 'Add products from the admin panel and they will appear here automatically.',
}: {
  products: ProductType[];
  id?: string;
  title?: string;
  kicker?: string;
  showTitle?: boolean;
  embedded?: boolean;
  enableModal?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [selected, setSelected] = useState<ProductType | null>(null);

  const content = (
    <div className="space-y-8">
      {showTitle ? <SectionTitle title={title} kicker={kicker} /> : null}
      {products.length ? (
        <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, wide: 3 }}>
          {products.map((product) => {
            const imageSrc = product.heroImage || product.image || '/dnr/page_06.png';
            return (
              <article
                key={product._id || product.slug || product.title}
                className="glass group flex h-full flex-col gap-4 rounded-[26px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_24px_54px_rgba(15,23,42,0.13)]"
              >
                <button
                  type="button"
                  className={`flex h-full flex-col gap-4 text-left ${enableModal ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={enableModal ? () => setSelected(product) : undefined}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] border border-secondary/10 bg-muted/40">
                    <Image src={imageSrc} alt={product.title} fill className="object-cover transition duration-500 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/18 via-transparent to-transparent" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-secondary">{product.title}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-secondary/80">
                      {product.shortDescription || product.description || 'Product details will appear here once added from the admin panel.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-secondary/10 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/45">Machinery range</span>
                    {enableModal ? <span className="text-sm font-semibold text-primary transition group-hover:translate-x-1">View details →</span> : null}
                  </div>
                </button>
              </article>
            );
          })}
        </ContentCarousel>
      ) : (
        <div className="rounded-3xl border border-dashed border-secondary/20 bg-white/80 px-6 py-12 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-secondary">{emptyTitle}</h3>
          <p className="mt-2 text-sm text-secondary/70">{emptyDescription}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {embedded ? content : <section id={id} className="container-wide mt-16 scroll-mt-28 space-y-8">{content}</section>}
      {enableModal && selected ? <ProductModal product={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
