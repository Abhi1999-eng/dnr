export type ContactActionType = 'scroll' | 'whatsapp' | 'phone' | 'email' | 'custom';

export function normalizeWhatsappNumber(value?: string) {
  return String(value || '').replace(/[^0-9]/g, '');
}

export function resolveContactActionHref(
  type: ContactActionType | string | undefined,
  value?: string,
  fallback = '#contact'
) {
  switch (type) {
    case 'whatsapp': {
      const digits = normalizeWhatsappNumber(value);
      return digits ? `https://wa.me/${digits}` : fallback;
    }
    case 'phone':
      return value ? `tel:${value}` : fallback;
    case 'email':
      return value ? `mailto:${value}` : fallback;
    case 'custom':
      return value || fallback;
    case 'scroll':
    default:
      return value || fallback;
  }
}

export function isExternalActionHref(href?: string) {
  return !!href && /^(https?:|mailto:|tel:)/.test(href);
}
