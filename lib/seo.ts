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
  const contactPoints = phones.length
    ? phones.map((phone: string) => ({
        '@type': 'ContactPoint',
        telephone: phone,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      }))
    : undefined;

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
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: contactPoints,
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

export function buildWebPageJsonLd(input: {
  name: string;
  description?: string | null;
  path: string;
  image?: string | null;
}) {
  const image = resolveMediaUrl(input.image, DEFAULT_OG_IMAGE);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: trimDescription(input.description),
    url: absoluteUrl(input.path),
    image: image.startsWith('http') ? image : absoluteUrl(image),
  };
}

export function buildQuoteContactAction(targetPath: string) {
  return {
    '@type': 'ContactAction',
    name: 'Request Quote',
    target: absoluteUrl(targetPath),
  };
}

export function buildProductDetailSchema(product: any) {
  const image = resolveMediaUrl(product?.heroImage || product?.image, DEFAULT_OG_IMAGE);
  const path = `/products/${product?.slug || ''}`;
  const description = trimDescription(product?.seo?.description || product?.description || product?.shortDescription, DEFAULT_DESCRIPTION, 220);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: product?.title,
    description,
    url: absoluteUrl(path),
    image: image.startsWith('http') ? image : absoluteUrl(image),
    mainEntity: {
      '@type': 'Service',
      name: product?.title,
      description,
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
      serviceType: 'Industrial machinery supply and support',
      category: product?.category || 'Industrial Machinery',
      potentialAction: buildQuoteContactAction(path),
    },
  };
}

export function buildServiceJsonLd(service: any) {
  const image = resolveServiceImage(service, DEFAULT_OG_IMAGE);
  const path = `/services/${service?.slug || ''}`;
  const description = trimDescription(service?.longDescription || service?.description, DEFAULT_DESCRIPTION, 220);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: service?.title,
    description,
    url: absoluteUrl(path),
    image: image.startsWith('http') ? image : absoluteUrl(image),
    mainEntity: {
      '@type': 'Service',
      serviceType: service?.title || 'Industrial machinery support service',
      name: service?.title,
      description,
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
      category: service?.category || 'Industrial Services',
      potentialAction: buildQuoteContactAction(path),
    },
  };
}
