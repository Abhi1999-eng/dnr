"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { SectionTitle } from './SectionTitle';
import { ContentCarousel } from './ContentCarousel';
import { ManagedImage } from './ManagedImage';
import { Reveal } from './Reveal';
import type { ProductType } from '@/types';
import { resolveProductImage } from '@/lib/media';

const ProductModal = dynamic(() => import('./ProductModal').then((mod) => mod.ProductModal), {
  ssr: false,
});

export function ProductGrid({
  products,
  quickLinks,
  fallbackPhone,
  fallbackWhatsapp,
  fallbackEmail,
  id = 'products',
  title = 'Products we support',
  kicker = 'Production-ready machinery and engineering support for casting, machining, fabrication, automation, and testing lines.',
  showTitle = true,
  embedded = false,
  enableModal = false,
  emptyTitle = 'No products added yet',
  emptyDescription = 'Add products from the admin panel and they will appear here automatically.',
  theme = 'light',
}: {
  products: ProductType[];
  quickLinks?: { label: string; value?: string; type?: 'phone' | 'email' | 'whatsapp' | 'custom'; href?: string }[];
  fallbackPhone?: string;
  fallbackWhatsapp?: string;
  fallbackEmail?: string;
  id?: string;
  title?: string;
  kicker?: string;
  showTitle?: boolean;
  embedded?: boolean;
  enableModal?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  theme?: 'light' | 'dark';
}) {
  const [selected, setSelected] = useState<ProductType | null>(null);
  const isDark = theme === 'dark';

  const content = (
    <div className="space-y-4">
      {showTitle ? <SectionTitle title={title} kicker={kicker} theme={theme} eyebrow={isDark ? 'Machinery range' : undefined} /> : null}
      {products.length ? (
        <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, wide: 3 }} theme={theme}>
          {products.map((product, index) => {
            const imageSrc = resolveProductImage(product);
            return (
              <Reveal key={product._id || product.slug || product.title} delay={index * 0.06} className="h-full">
                <article
                  className={`group flex h-full flex-col gap-2.5 rounded-[22px] border p-4 shadow-[0_14px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 ${
                    isDark
                      ? 'border-[rgba(126,211,33,0.16)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(13,20,28,0.98))] shadow-[0_24px_52px_rgba(0,0,0,0.24)] hover:border-[#7ed321]/45 hover:shadow-[0_28px_64px_rgba(0,0,0,0.34)]'
                      : 'glass border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] hover:border-primary/30 hover:shadow-[0_24px_54px_rgba(15,23,42,0.13)]'
                  }`}
                >
                  <button
                    type="button"
                    className={`flex h-full flex-col gap-3 text-left ${enableModal ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={enableModal ? () => setSelected(product) : undefined}
                  >
                    <div
                      className={`flex h-[180px] w-full items-center justify-center overflow-hidden rounded-[18px] border p-3 md:h-[200px] lg:h-[210px] ${
                        isDark ? 'border-[rgba(126,211,33,0.16)] bg-[radial-gradient(circle_at_top,rgba(126,211,33,0.16),transparent_52%),#0b1218]' : 'border-secondary/10 bg-slate-50'
                      }`}
                    >
                      <ManagedImage
                        src={imageSrc}
                        alt={product.title}
                        width={1200}
                        height={900}
                        className="h-full w-full object-contain object-center"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className={isDark ? 'text-base font-semibold text-white' : 'text-base font-semibold text-secondary'}>{product.title}</h3>
                      <p className={isDark ? 'line-clamp-3 text-sm leading-6 text-[#aab4bd]' : 'line-clamp-3 text-sm leading-6 text-secondary/80'}>
                        {product.shortDescription || product.description || 'Product details will appear here once added from the admin panel.'}
                      </p>
                    </div>
                    <div className={`flex items-center justify-between border-t pt-2.5 ${isDark ? 'border-white/8' : 'border-secondary/10'}`}>
                      <span className={isDark ? 'text-xs font-semibold uppercase tracking-[0.18em] text-white/65' : 'text-xs font-semibold uppercase tracking-[0.18em] text-secondary/75'}>Machinery range</span>
                      {enableModal ? <span className={isDark ? 'text-sm font-semibold text-white transition group-hover:translate-x-1 group-hover:text-[#7ed321]' : 'text-sm font-semibold text-secondary transition group-hover:translate-x-1 group-hover:text-primary'}>View details →</span> : null}
                    </div>
                  </button>
                </article>
              </Reveal>
            );
          })}
        </ContentCarousel>
      ) : (
        <div
          className={`rounded-3xl border border-dashed px-6 py-12 text-center ${
            isDark ? 'border-white/12 bg-[#111b24]/90 text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)]' : 'border-secondary/20 bg-white/80 shadow-sm'
          }`}
        >
          <h3 className={isDark ? 'text-base font-semibold text-white' : 'text-base font-semibold text-secondary'}>{emptyTitle}</h3>
          <p className={isDark ? 'mt-2 text-sm text-[#aab4bd]' : 'mt-2 text-sm text-secondary/70'}>{emptyDescription}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {embedded ? content : <section id={id} className="container-wide mt-10 scroll-mt-24 space-y-4">{content}</section>}
      {enableModal && selected ? (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          quickLinks={quickLinks}
          fallbackPhone={fallbackPhone}
          fallbackWhatsapp={fallbackWhatsapp}
          fallbackEmail={fallbackEmail}
        />
      ) : null}
    </>
  );
}
