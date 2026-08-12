import type { Metadata } from 'next';
import { resolveMediaUrl, resolveServiceImage } from './media';

export const SITE_NAME = 'DNR Techno Services';
export const SITE_URL = 'https://dnrtechnoservices.com';
export const DEFAULT_DESCRIPTION =
  'DNR Techno Services supplies industrial machinery, installation support, commissioning, and plant-focused engineering services across India.';
const DEFAULT_OG_IMAGE = '/logo-dnr.png';

export function isPlaceholderText(value?: string | null) {
  return /\b(dummy|lorem ipsum|placeholder|sample testimonial|test testimonial)\b/i.test(String(value || ''));
}

function normalizePublicUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function normalizeTitle(title: string) {
  const trimmed = String(title || '').trim();
  if (!trimmed) return SITE_NAME;

  const lower = trimmed.toLowerCase();
  const siteLower = SITE_NAME.toLowerCase();

  if (lower === siteLower) {
    return SITE_NAME;
  }

  if (lower.endsWith(`| ${siteLower}`) || lower.endsWith(`- ${siteLower}`) || lower.endsWith(`: ${siteLower}`)) {
    return trimmed.slice(0, Math.max(0, trimmed.length - SITE_NAME.length - 2)).trim();
  }

  return trimmed;
}

export function absoluteUrl(path = '/') {
  if (!path || path === '/') {
    return SITE_URL;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function trimDescription(value?: string | null, fallback = DEFAULT_DESCRIPTION, max = 160) {
  const content = String(value || fallback)
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  if (content.length <= max) {
    return content;
  }

  const candidate = content.slice(0, max + 1);
  const sentenceEnd = Math.max(candidate.lastIndexOf('. '), candidate.lastIndexOf('! '), candidate.lastIndexOf('? '));
  if (sentenceEnd >= Math.floor(max * 0.55)) {
    return candidate.slice(0, sentenceEnd + 1).trim();
  }

  const wordEnd = candidate.lastIndexOf(' ');
  const shortened = candidate.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[\s,;:.-]+$/, '').trim();
  return shortened.endsWith('.') || shortened.endsWith('!') || shortened.endsWith('?') ? shortened : `${shortened}.`;
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
  const normalizedTitle = normalizeTitle(title);
  const fullTitle =
    normalizedTitle === SITE_NAME
      ? `${SITE_NAME} | Industrial Machinery and Engineering Support`
      : normalizedTitle.includes(SITE_NAME)
        ? normalizedTitle
        : `${normalizedTitle} | ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const resolvedDescription = trimDescription(description);
  const resolvedImage = image?.startsWith('http') ? image : absoluteUrl(image || DEFAULT_OG_IMAGE);

  return {
    title: {
      absolute: fullTitle,
    },
    description: resolvedDescription,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: fullTitle,
      description: resolvedDescription,
      siteName: SITE_NAME,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
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
  const phones = [...new Set([settings?.primaryPhone, settings?.secondaryPhone, ...(settings?.phone || [])].filter(Boolean))];
  const sameAs = (Array.isArray(settings?.socialLinks) ? settings.socialLinks : [])
    .map((item: unknown) => normalizePublicUrl(typeof item === 'string' ? item : (item as { url?: string })?.url))
    .filter(Boolean);
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
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
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

export function buildCollectionPageJsonLd(input: {
  name: string;
  description?: string | null;
  path: string;
  image?: string | null;
}) {
  const image = resolveMediaUrl(input.image, DEFAULT_OG_IMAGE);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: trimDescription(input.description),
    url: absoluteUrl(input.path),
    image: image.startsWith('http') ? image : absoluteUrl(image),
  };
}

export function buildItemListJsonLd(input: {
  name: string;
  path: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    url: absoluteUrl(input.path),
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : absoluteUrl(item.url),
    })),
  };
}

export function buildQuoteContactAction(targetPath: string) {
  return {
    '@type': 'ContactAction',
    name: 'Request Quote',
    target: absoluteUrl(targetPath),
  };
}

export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  if (!items.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
