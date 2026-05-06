const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

function stripUnsafeSlashes(value: string) {
  return value.replace(/\\/g, '/');
}

export function sanitizeUploadFilename(filename: string) {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : '';
  const base = filename.slice(0, filename.length - ext.length);
  const cleanedBase = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${cleanedBase || 'upload'}${ext}`;
}

export function resolveMediaUrl(input?: string | null, fallback = '/dnr/page_06.png') {
  if (!input) return fallback;

  const trimmed = stripUnsafeSlashes(String(input).trim());
  if (!trimmed) return fallback;

  if (LOCAL_ORIGIN_RE.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return encodeURI(url.pathname || fallback);
    } catch {
      return fallback;
    }
  }

  if (trimmed.startsWith('/public/')) {
    return encodeURI(trimmed.replace(/^\/public/, ''));
  }

  if (trimmed.startsWith('/')) {
    return encodeURI(trimmed);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return encodeURI(trimmed);
  }

  return encodeURI(`/${trimmed.replace(/^\/+/, '')}`);
}

export function resolveProductImage(product?: { heroImage?: string; image?: string } | null, fallback = '/dnr/page_06.png') {
  return resolveMediaUrl(product?.heroImage || product?.image, fallback);
}

export function resolveServiceImage(service?: { image?: string | null; imageUrl?: string | null; coverImage?: string | null } | null, fallback = '/dnr/page_21.png') {
  return resolveMediaUrl(service?.image || service?.imageUrl || service?.coverImage, fallback);
}

export function isDirectUploadAsset(src?: string | null) {
  if (!src) return false;
  return resolveMediaUrl(src).includes('/uploads/');
}
