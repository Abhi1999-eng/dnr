import rawContent from '@/data/die-casting-product-seo.json';

type ProductFaq = {
  question: string;
  answer: string;
};

type ProductSeoContent = {
  metadataTitle: string;
  metadataDescription: string;
  keywords: string[];
  shortDescription?: string;
  longDescription?: string;
  overview?: string[];
  industries?: string[];
  faqs?: ProductFaq[];
  relatedSlugs?: string[];
};

const productSeoContent = rawContent as Record<string, ProductSeoContent>;

export function getProductSeoContent(productOrSlug: { slug?: string | null } | string | null | undefined) {
  const slug = typeof productOrSlug === 'string' ? productOrSlug : productOrSlug?.slug;
  if (!slug) return null;
  return productSeoContent[slug] || null;
}

export const dieCastingProductSeoContent = productSeoContent;

