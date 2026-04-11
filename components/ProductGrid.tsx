"use client";
import Image from 'next/image';
import { useState } from 'react';
import { SectionTitle } from './SectionTitle';
import { ProductModal } from './ProductModal';

export type ProductType = {
  _id?: string;
  title: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  heroImage?: string;
  category?: { name?: string; slug?: string };
  applications?: string[];
  features?: string[];
  specs?: { label: string; value: string }[];
  slug?: string;
};

export function ProductGrid({
  products,
  showTitle = true,
  embedded = false,
  enableModal = false,
}: {
  products: ProductType[];
  showTitle?: boolean;
  embedded?: boolean;
  enableModal?: boolean;
}) {
  const [selected, setSelected] = useState<ProductType | null>(null);
  const content = (
    <div className="space-y-8">
      {showTitle && <SectionTitle title="Products we deploy" kicker="Upload your product visuals; assets live on S3 in prod, local uploads during development." />}
      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          // compute a safe image source for Next/Image
          <div
            key={product._id || product.title}
            className="glass p-5 rounded-xl card-hover border border-muted/80 flex flex-col gap-4 bg-white shadow-lg shadow-secondary/10"
            role={enableModal ? 'button' : undefined}
            onClick={enableModal ? () => setSelected(product) : undefined}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-white/5 border border-white/10">
              {(() => {
                const imgSrc = product.image || product.heroImage || '/dnr/page_06.png';
                return (
                <Image
                  src={imgSrc}
                alt={product.title}
                width={640}
                height={360}
                className="h-40 w-full object-cover"
                priority
              />
                );
              })()}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-secondary">{product.title}</h3>
              <p className="text-secondary/80 text-sm leading-relaxed line-clamp-3">{product.shortDescription || product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {embedded ? content : <section id="products" className="container-wide mt-16 space-y-8">{content}</section>}
      {enableModal && selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
