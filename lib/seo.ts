import type { Metadata } from 'next';
import { resolveMediaUrl, resolveServiceImage } from './media';

export const SITE_NAME = 'DNR Techno Services';
export const SITE_URL = 'https://dnrtechnoservices.com';
export const DEFAULT_DESCRIPTION =
  'DNR Techno Services supplies industrial machinery, installation support, commissioning, and plant-focused engineering services across India.';
const DEFAULT_OG_IMAGE = '/logo-dnr.png';

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function trimDescription(value?: string | null, fallback = DEFAULT_DESCRIPTION, max = 160) {
  const content = (value || fallback).replace(/\s+/g, ' ').trim();
  return content.length > max ? `${content.slice(0, max - 1).trim()}…` : content;
}

type MetadataOptions = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keywords = [],
  noIndex = false,
}: MetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const resolvedDescription = trimDescription(description);
  const resolvedImage = image?.startsWith('http') ? image : absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title,
    description: resolvedDescription,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description: resolvedDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: resolvedDescription,
      images: [resolvedImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildOrganizationJsonLd(settings: any = {}) {
  const phones = [settings?.primaryPhone, settings?.secondaryPhone, ...(settings?.phone || [])].filter(Boolean);
  const sameAs = [settings?.website, settings?.mapLink].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Organization'],
    name: settings?.companyName || SITE_NAME,
    url: SITE_URL,
    logo: settings?.logo ? absoluteUrl(settings.logo) : absoluteUrl(DEFAULT_OG_IMAGE),
    image: settings?.logo ? absoluteUrl(settings.logo) : absoluteUrl(DEFAULT_OG_IMAGE),
    description: trimDescription(settings?.seo?.description || settings?.footerDescription || DEFAULT_DESCRIPTION, DEFAULT_DESCRIPTION, 220),
    telephone: phones[0],
    email: settings?.email,
    address: settings?.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressCountry: 'IN',
        }
      : undefined,
    areaServed: 'India',
    sameAs,
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-IN',
  };
}

export function buildProductJsonLd(product: any) {
  const image = resolveMediaUrl(product?.heroImage || product?.image, DEFAULT_OG_IMAGE);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.title,
    description: trimDescription(product?.seo?.description || product?.description || product?.shortDescription, DEFAULT_DESCRIPTION, 220),
    image: [image.startsWith('http') ? image : absoluteUrl(image)],
    sku: product?.slug,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: 'Industrial Machinery',
  };
}

export function buildServiceJsonLd(service: any) {
  const image = resolveServiceImage(service, DEFAULT_OG_IMAGE);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service?.title,
    name: service?.title,
    description: trimDescription(service?.longDescription || service?.description, DEFAULT_DESCRIPTION, 220),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: 'India',
    image: image.startsWith('http') ? image : absoluteUrl(image),
  };
}
