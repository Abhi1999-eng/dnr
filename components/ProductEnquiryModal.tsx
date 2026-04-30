'use client';

import { Mail, MessageCircle, PhoneCall, X } from 'lucide-react';
import { useEffect } from 'react';
import { InquiryForm } from '@/components/InquiryForm';
import { normalizeWhatsappNumber } from '@/lib/contact-actions';

type QuickLink = {
  label: string;
  value?: string;
  type?: 'phone' | 'email' | 'whatsapp' | 'custom';
  href?: string;
};

type ProductEnquiryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productSlug?: string;
  productUrl?: string;
  quickLinks?: QuickLink[];
  fallbackPhone?: string;
  fallbackWhatsapp?: string;
  fallbackEmail?: string;
};

function buildQuickLinks(quickLinks: QuickLink[] | undefined, fallbackPhone?: string, fallbackWhatsapp?: string, fallbackEmail?: string) {
  if (quickLinks?.length) {
    return quickLinks
      .filter((item) => item && item.label)
      .map((item) => {
        const href =
          item.href ||
          (item.type === 'phone'
            ? `tel:${item.value}`
            : item.type === 'email'
              ? `mailto:${item.value}`
              : item.type === 'whatsapp'
                ? `https://wa.me/${normalizeWhatsappNumber(item.value)}`
                : item.value || '#contact');

        const icon = item.type === 'email' ? Mail : item.type === 'whatsapp' ? MessageCircle : PhoneCall;
        return {
          label: item.label,
          href,
          icon,
          external: item.type === 'whatsapp' || String(href).startsWith('http'),
        };
      });
  }

  return [
    fallbackPhone ? { label: 'Call Sales', href: `tel:${fallbackPhone}`, icon: PhoneCall, external: false } : null,
    fallbackWhatsapp ? { label: 'WhatsApp Support', href: `https://wa.me/${normalizeWhatsappNumber(fallbackWhatsapp)}`, icon: MessageCircle, external: true } : null,
    fallbackEmail ? { label: 'Email DNR', href: `mailto:${fallbackEmail}`, icon: Mail, external: false } : null,
  ].filter(Boolean) as { label: string; href: string; icon: typeof PhoneCall; external: boolean }[];
}

export function ProductEnquiryModal({
  isOpen,
  onClose,
  productName,
  productSlug,
  productUrl,
  quickLinks,
  fallbackPhone = '+919711196735',
  fallbackWhatsapp = '+919711196735',
  fallbackEmail = 'dnr.techservices@gmail.com',
}: ProductEnquiryModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contactItems = buildQuickLinks(quickLinks, fallbackPhone, fallbackWhatsapp, fallbackEmail);

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed left-1/2 top-[52%] z-[90] flex max-h-[90vh] w-[calc(100%-2rem)] max-w-[1080px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] md:max-h-[76vh] md:w-[calc(100%-3rem)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Enquire about ${productName}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary/70 transition hover:border-primary/35 hover:bg-slate-50 hover:text-secondary"
          aria-label="Close enquiry modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="space-y-1.5">
            <p className="pill inline-flex">Product enquiry</p>
            <div className="space-y-1">
              <h2 className="pr-14 text-xl font-semibold text-secondary sm:text-2xl">Enquire About This Product</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-secondary/70">
                Share your requirement and our team will contact you with the right product recommendation.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 self-start rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/60">Selected product</p>
              <p className="text-lg font-semibold text-secondary">{productName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/60">Quick contact</p>
              <div className="space-y-2">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="flex min-h-[46px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-secondary transition hover:border-primary/35 hover:bg-primary/5"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4">
            <InquiryForm
              initialValues={{ productInterest: productName }}
              context={{ pageType: 'product', productTitle: productName, productUrl: productUrl || (productSlug ? `/products/${productSlug}` : '') }}
              config={{
                placeholders: {
                  message: `Tell us your requirement for ${productName}`,
                },
              }}
            />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
