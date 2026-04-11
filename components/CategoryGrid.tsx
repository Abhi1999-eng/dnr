"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { SectionTitle } from './SectionTitle';
import { CategoryType } from '@/types';
import { ProductType } from './ProductGrid';
import { ProductModal } from './ProductModal';

export function CategoryGrid({ categories, products = [] }: { categories: CategoryType[]; products?: ProductType[] }) {
  const [selected, setSelected] = useState<ProductType | null>(null);

  const productByCategory = useMemo(() => {
    const map = new Map<string, ProductType>();
    products.forEach((p) => {
      const key = (p.category?.slug || p.category?.name || '').toLowerCase();
      if (key && !map.has(key)) map.set(key, p);
    });
    return map;
  }, [products]);

  const displayCategories = categories.slice(0, 6);

  const pickProduct = (cat: CategoryType): ProductType => {
    const keySlug = cat.slug?.toLowerCase() || '';
    const keyName = cat.name?.toLowerCase() || '';

    const matched =
      productByCategory.get(keySlug) ||
      productByCategory.get(keyName) ||
      products.find((p) => p.slug?.toLowerCase() === keySlug) ||
      products.find((p) => p.title?.toLowerCase() === keyName) ||
      products.find((p) => p.title?.toLowerCase().includes(keyName));

    if (matched) return matched;

    // Fallback stub product so the modal still opens with category data
    return {
      title: cat.name,
      shortDescription: cat.description,
      image: cat.coverImage || '/dnr/page_06.png',
      category: { name: cat.name, slug: cat.slug },
      description: cat.description,
      heroImage: cat.coverImage,
      slug: cat.slug,
    };
  };

  return (
    <section id="categories" className="container-wide space-y-6 mt-16">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionTitle title="Product Categories" kicker="Precision machinery across casting, machining, marking, polishing, testing." />
        {categories.length > 6 && (
          <Link href="/products" className="text-primary font-semibold">
            View all →
          </Link>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {displayCategories.map((cat) => (
          <div
            key={cat.slug}
            className="glass border border-secondary/10 bg-white text-secondary rounded-2xl p-5 flex flex-col gap-3 shadow-lg shadow-secondary/10 card-hover cursor-pointer"
            onClick={() => {
              setSelected(pickProduct(cat));
            }}
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-muted/40 border border-secondary/10 aspect-[4/3]">
              {(() => {
                const productMatch = pickProduct(cat);
                const imgSrc = productMatch.heroImage || productMatch.image || cat.coverImage || '/dnr/page_06.png';
                return <Image src={imgSrc} alt={cat.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />;
              })()}
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-secondary">{cat.name}</h3>
              <p className="text-sm text-secondary/80 leading-relaxed line-clamp-3">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
