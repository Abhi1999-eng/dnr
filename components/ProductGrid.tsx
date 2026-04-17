"use client";

import Image from 'next/image';
import { useState } from 'react';
import { SectionTitle } from './SectionTitle';
import { ProductModal } from './ProductModal';
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const imageSrc = product.heroImage || product.image || '/dnr/page_06.png';
            return (
              <article
                key={product._id || product.slug || product.title}
                className="glass flex h-full flex-col gap-4 rounded-2xl border border-secondary/10 bg-white p-5 shadow-lg shadow-secondary/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <button
                  type="button"
                  className={`flex h-full flex-col gap-4 text-left ${enableModal ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={enableModal ? () => setSelected(product) : undefined}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-secondary/10 bg-muted/40">
                    <Image src={imageSrc} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-secondary">{product.title}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-secondary/80">
                      {product.shortDescription || product.description || 'Product details will appear here once added from the admin panel.'}
                    </p>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
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
