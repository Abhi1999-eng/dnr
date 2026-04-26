const UPPERCASE_TERMS = new Set(['CNC', 'VMC', 'HMC', 'VTL', 'DNR', 'PLC', 'CMM']);

export const BULK_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export const BULK_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
export const MAX_BULK_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;

export function slugifyProduct(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function toTitleToken(token: string) {
  const upper = token.toUpperCase();
  if (UPPERCASE_TERMS.has(upper)) return upper;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function filenameToProductTitle(filename: string) {
  const withoutExt = filename.replace(/\.[^.]+$/, '');
  const normalized = withoutExt
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-zA-Z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return 'Product';
  return normalized
    .split(' ')
    .filter(Boolean)
    .map(toTitleToken)
    .join(' ');
}

export function getFileExtension(filename: string) {
  const match = filename.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] || '';
}

export function isAcceptedImageFile(file: File) {
  const extension = getFileExtension(file.name);
  return BULK_IMAGE_CONTENT_TYPES.has(file.type) || BULK_IMAGE_EXTENSIONS.has(extension);
}
