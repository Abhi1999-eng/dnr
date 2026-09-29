import type { Metadata } from 'next';
import { resolveMediaUrl, resolveServiceImage } from './media';

export const SITE_NAME = 'DNR Techno Services';
export const SITE_URL = 'https://dnrtechnoservices.com';
export const HOMEPAGE_META_TITLE = 'Industrial Machinery & Engineering Support';
export const HOMEPAGE_META_DESCRIPTION =
  'DNR Techno Services supplies industrial machinery, installation support, commissioning, breakdown maintenance, and spare parts support for manufacturing teams across India.';
export const DEFAULT_DESCRIPTION =
  'DNR Techno Services supplies industrial machinery, installation support, commissioning, and plant-focused engineering services across India.';
const DEFAULT_OG_IMAGE = '/logo-dnr.png';

/**
 * Google renders roughly 60 characters of a title and about 155 characters of a
 * description in search results.
 */
export const MAX_SERP_TITLE_LENGTH = 65;
export const MIN_META_DESCRIPTION_LENGTH = 110;

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

/**
 * Connecting words that must not be left at the end of a truncated description.
 */
const TRAILING_CONNECTIVE =
  /[\s,;:-]+(?:a|an|and|as|at|but|by|for|from|in|including|into|like|of|on|or|over|per|plus|so|than|that|the|their|these|this|those|through|to|under|until|up|upon|via|with|within|without|across|about|after|before|between|during|is|are|was|were|be|been|its|our|your|we|they|it)$/i;

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
  // Only stop at a sentence boundary when it is already close to the limit.
  // A lower threshold threw away up to 70 usable characters of snippet whenever a
  // description opened with one short sentence.
  if (sentenceEnd >= Math.floor(max * 0.8)) {
    return candidate.slice(0, sentenceEnd + 1).trim();
  }

  const wordEnd = candidate.lastIndexOf(' ');
  let shortened = candidate.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[\s,;:.-]+$/, '').trim();

  // A word-boundary cut can strand a connecting word, leaving snippets that read
  // "...engineering services for." Drop any trailing connectives.
  let trimmed = true;
  while (trimmed) {
    trimmed = false;
    const next = shortened.replace(TRAILING_CONNECTIVE, '');
    if (next !== shortened && next.trim()) {
      shortened = next.replace(/[\s,;:.-]+$/, '').trim();
      trimmed = true;
    }
  }

  return shortened.endsWith('.') || shortened.endsWith('!') || shortened.endsWith('?') ? shortened : `${shortened}.`;
}

/**
 * Picks the first candidate long enough to be a useful search snippet.
 *
 * Short CMS display fields (a section kicker, a single product's summary) used to
 * be passed straight through as meta descriptions, which wasted most of the snippet
 * and, on listing pages, made the description change with content ordering.
 */
export function pickMetaDescription(...candidates: Array<string | null | undefined>) {
  const usable = candidates
    .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= MIN_META_DESCRIPTION_LENGTH);

  return usable[0] || String(candidates.filter(Boolean)[0] || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim();
}

type MetadataOptions = {
  title: string;
  description?: string | null;
  path?: string;
  image?: string | null;
  keywords?: string[];
  noIndex?: boolean;
};

function resolveHomepageTitle(title: string) {
  const cleanTitle = title.replace(/\s+/g, ' ').trim();
  const genericTitles = new Set([
    SITE_NAME,
    `${SITE_NAME} | ${SITE_NAME}`,
    'Industrial Machinery and Engineering Support',
    'Industrial Machinery & Engineering Support',
  ]);

  return genericTitles.has(cleanTitle) ? HOMEPAGE_META_TITLE : cleanTitle;
}

function resolveHomepageDescription(description?: string | null) {
  const cleanDescription = (description || '').replace(/\s+/g, ' ').trim();

  if (!cleanDescription || cleanDescription.length < 90 || cleanDescription === DEFAULT_DESCRIPTION) {
    return HOMEPAGE_META_DESCRIPTION;
  }

  return cleanDescription;
}

/**
 * Google renders roughly 60 characters of a title in search results. Titles are
 * not truncated automatically, because a hard cut can strip a product name, but
 * over-long ones are reported during development so they get rewritten at source.
 */
function warnOnWeakMetadata(path: string, title: string, description: string) {
  if (process.env.NODE_ENV === 'production') return;

  if (title.length > MAX_SERP_TITLE_LENGTH) {
    console.warn(`[seo] title is ${title.length} chars (max ${MAX_SERP_TITLE_LENGTH}) for "${path}": ${title}`);
  }
  if (description.length < MIN_META_DESCRIPTION_LENGTH) {
    console.warn(`[seo] description is only ${description.length} chars for "${path}": ${description}`);
  }
}

export function createPageMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keywords = [],
  noIndex = false,
}: MetadataOptions): Metadata {
  const isHomepage = path === '/' || path === '';
  const normalizedTitle = normalizeTitle(isHomepage ? resolveHomepageTitle(title) : title);
  const fullTitle =
    normalizedTitle === SITE_NAME
      ? `${SITE_NAME} | Industrial Machinery and Engineering Support`
      : normalizedTitle.includes(SITE_NAME)
        ? normalizedTitle
        : `${normalizedTitle} | ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const resolvedDescription = trimDescription(isHomepage ? resolveHomepageDescription(description) : description);
  const resolvedImage = image?.startsWith('http') ? image : absoluteUrl(image || DEFAULT_OG_IMAGE);

  warnOnWeakMetadata(canonical, fullTitle, resolvedDescription);

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

/**
 * Indian states and union territories, used to decide whether a parsed city name
 * can safely double as `addressRegion`. Anything not on this list is left blank
 * rather than guessed, because a wrong region breaks Google Business matching.
 */
const INDIAN_REGIONS = new Set(
  [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
    'Puducherry',
  ].map((name) => name.toLowerCase())
);

export type ParsedAddress = {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
};

/**
 * Splits a single-line address into schema.org PostalAddress components.
 *
 * Google needs `addressLocality` and `postalCode` as discrete fields to match a
 * website's address against its Google Business Profile listing. Emitting the
 * whole address as one `streetAddress` blob leaves that match to guesswork.
 */
export function parsePostalAddress(address?: string | null): ParsedAddress | null {
  const raw = String(address || '').replace(/\s+/g, ' ').trim();
  if (!raw) return null;

  let parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return null;

  // Trailing country token, e.g. "... , INDIA"
  if (/^(india|bharat|in)$/i.test(parts[parts.length - 1])) {
    parts = parts.slice(0, -1);
  }

  const postalMatch = raw.match(/\b([1-9]\d{5})\b/);
  const postalCode = postalMatch?.[1];

  let addressLocality: string | undefined;
  let explicitRegion: string | undefined;
  let streetParts = parts;

  if (postalCode) {
    // The segment carrying the PIN code also carries the city, e.g. "Delhi-110092".
    const idx = parts.findIndex((part) => part.includes(postalCode));
    if (idx >= 0) {
      const locality = parts[idx]
        .replace(postalCode, '')
        .replace(/\b(pin|pin\s*code|postal\s*code)\b/gi, '')
        .replace(/[\s,;:–—-]+$/, '')
        .replace(/^[\s,;:–—-]+/, '')
        .trim();
      addressLocality = locality || undefined;
      streetParts = parts.slice(0, idx);

      // When the PIN code sits on the state segment ("..., Noida, Uttar Pradesh 201301")
      // the captured name is the region, not the city, so step back one segment.
      if (addressLocality && INDIAN_REGIONS.has(addressLocality.toLowerCase()) && streetParts.length > 1) {
        explicitRegion = addressLocality;
        addressLocality = streetParts[streetParts.length - 1];
        streetParts = streetParts.slice(0, -1);
      }
    }
  }

  // No PIN code to anchor on: treat the last segment as the city.
  if (!addressLocality && parts.length > 1) {
    addressLocality = parts[parts.length - 1];
    streetParts = parts.slice(0, -1);
  }

  const streetAddress = streetParts.join(', ').trim() || undefined;
  // A city name is only reused as the region when it is itself a state or union
  // territory (Delhi, Chandigarh, Puducherry). Otherwise the region is left blank
  // rather than guessed.
  const addressRegion =
    explicitRegion || (addressLocality && INDIAN_REGIONS.has(addressLocality.toLowerCase()) ? addressLocality : undefined);

  return {
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry: 'IN',
  };
}

/**
 * Builds the schema.org PostalAddress node, preferring explicit CMS values over
 * anything derived from the single-line address.
 */
export function buildPostalAddressJsonLd(settings: any = {}) {
  const parsed = parsePostalAddress(settings?.address);
  const streetAddress = settings?.streetAddress || parsed?.streetAddress;
  const addressLocality = settings?.addressLocality || parsed?.addressLocality;
  const addressRegion = settings?.addressRegion || parsed?.addressRegion;
  const postalCode = settings?.postalCode || parsed?.postalCode;

  if (!streetAddress && !addressLocality && !postalCode) {
    return undefined;
  }

  return {
    '@type': 'PostalAddress',
    streetAddress: streetAddress || undefined,
    addressLocality: addressLocality || undefined,
    addressRegion: addressRegion || undefined,
    postalCode: postalCode || undefined,
    addressCountry: 'IN',
  };
}

/** De-duplicated, non-empty phone numbers from every settings field that holds one. */
export function collectBusinessPhones(settings: any = {}): string[] {
  return [
    ...new Set(
      [settings?.primaryPhone, settings?.secondaryPhone, ...(Array.isArray(settings?.phone) ? settings.phone : [])]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    ),
  ];
}

/**
 * Public profile URLs for `sameAs`. The Google Business Profile URL is included
 * first because `sameAs` is one of the signals Google uses to reconcile a website
 * with its Business Profile listing.
 */
export function collectSameAs(settings: any = {}): string[] {
  const candidates = [
    settings?.googleBusinessProfileUrl,
    ...(Array.isArray(settings?.socialLinks) ? settings.socialLinks : []),
  ].map((item: unknown) => normalizePublicUrl(typeof item === 'string' ? item : (item as { url?: string })?.url));

  return [...new Set(candidates.filter(Boolean) as string[])];
}

function buildGeoJsonLd(settings: any = {}) {
  const latitude = Number(settings?.geo?.latitude);
  const longitude = Number(settings?.geo?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
    return undefined;
  }

  return { '@type': 'GeoCoordinates', latitude, longitude };
}

function buildOpeningHoursJsonLd(settings: any = {}) {
  const entries = Array.isArray(settings?.openingHours) ? settings.openingHours : [];
  const specs = entries
    .map((entry: any) => {
      const days = (Array.isArray(entry?.days) ? entry.days : [])
        .map((day: unknown) => String(day || '').trim())
        .filter(Boolean);
      const opens = String(entry?.opens || '').trim();
      const closes = String(entry?.closes || '').trim();
      if (!days.length || !opens || !closes) return null;

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days.map((day: string) => `https://schema.org/${day}`),
        opens,
        closes,
      };
    })
    .filter(Boolean);

  return specs.length ? specs : undefined;
}

/** `areaServed` built from the states configured in the CMS coverage map. */
function buildAreaServedJsonLd(settings: any = {}) {
  const states = (Array.isArray(settings?.coverageStates) ? settings.coverageStates : [])
    .map((state: unknown) => String(state || '').trim())
    .filter(Boolean);

  if (!states.length) {
    return { '@type': 'Country', name: 'India' };
  }

  return [
    { '@type': 'Country', name: 'India' },
    ...states.map((state: string) => ({
      '@type': 'State',
      name: state
        .split('-')
        .map((word) => (word.length <= 3 && /^(and|of)$/i.test(word) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' '),
      containedInPlace: { '@type': 'Country', name: 'India' },
    })),
  ];
}

function resolveBusinessDescription(settings: any = {}) {
  // `seo.description` is often a short brand tagline, too thin for a schema
  // description, so prefer the longest genuine copy available.
  const candidates = [settings?.footerDescription, settings?.seo?.description, DEFAULT_DESCRIPTION]
    .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= 60);

  return trimDescription(candidates[0] || DEFAULT_DESCRIPTION, DEFAULT_DESCRIPTION, 300);
}

/**
 * LocalBusiness node for the physical office. This is the schema Google reads
 * when reconciling the website with the Google Business Profile listing, so it
 * carries the parsed address, phones, map link, geo, and opening hours.
 *
 * Geo coordinates, opening hours, and the Business Profile URL are emitted only
 * when they are configured in the CMS: guessed local data is worse than absent
 * local data, because it conflicts with the verified listing.
 */
export function buildLocalBusinessJsonLd(settings: any = {}) {
  const address = buildPostalAddressJsonLd(settings);
  if (!address) {
    return null;
  }

  const phones = collectBusinessPhones(settings);
  const sameAs = collectSameAs(settings);
  const image = settings?.logo ? absoluteUrl(settings.logo) : absoluteUrl(DEFAULT_OG_IMAGE);
  const mapLink = normalizePublicUrl(settings?.mapLink);

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: settings?.companyName || SITE_NAME,
    legalName: settings?.legalName || undefined,
    url: SITE_URL,
    logo: image,
    image,
    description: resolveBusinessDescription(settings),
    telephone: phones[0],
    email: settings?.email || undefined,
    address,
    geo: buildGeoJsonLd(settings),
    hasMap: mapLink || undefined,
    openingHoursSpecification: buildOpeningHoursJsonLd(settings),
    priceRange: settings?.priceRange || undefined,
    currenciesAccepted: 'INR',
    areaServed: buildAreaServedJsonLd(settings),
    sameAs: sameAs.length ? sameAs : undefined,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    vatID: settings?.gstin || undefined,
    foundingDate: settings?.foundingYear ? String(settings.foundingYear) : undefined,
  };
}

export function buildOrganizationJsonLd(settings: any = {}) {
  const phones = collectBusinessPhones(settings);
  const sameAs = collectSameAs(settings);
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
    legalName: settings?.legalName || undefined,
    url: SITE_URL,
    logo: settings?.logo ? absoluteUrl(settings.logo) : absoluteUrl(DEFAULT_OG_IMAGE),
    image: settings?.logo ? absoluteUrl(settings.logo) : absoluteUrl(DEFAULT_OG_IMAGE),
    description: resolveBusinessDescription(settings),
    telephone: phones[0],
    email: settings?.email,
    address: buildPostalAddressJsonLd(settings),
    areaServed: buildAreaServedJsonLd(settings),
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: contactPoints,
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
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
