import rawContent from '@/data/service-seo.json';

type ServiceSeoContent = {
  metadataTitle: string;
  metadataDescription: string;
  keywords: string[];
};

const serviceSeoContent = rawContent as Record<string, ServiceSeoContent>;

/**
 * Curated metadata for service detail pages, keyed by slug.
 *
 * Service titles come from the CMS, where they are written to read as headings
 * rather than as search results — two of them ran to 85 and 71 characters once
 * the brand suffix was appended, which Google truncates. This file overrides the
 * metadata without touching the heading shown on the page.
 */
export function getServiceSeoContent(serviceOrSlug: { slug?: string | null } | string | null | undefined) {
  const slug = typeof serviceOrSlug === 'string' ? serviceOrSlug : serviceOrSlug?.slug;
  if (!slug) return null;
  return serviceSeoContent[slug] || null;
}

export const allServiceSeoContent = serviceSeoContent;
