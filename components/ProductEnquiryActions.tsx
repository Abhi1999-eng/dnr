'use client';

import { MessageCircle, PhoneCall } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductEnquiryModal } from '@/components/ProductEnquiryModal';
import { normalizeWhatsappNumber } from '@/lib/contact-actions';

type QuickLink = {
  label: string;
  value?: string;
  type?: 'phone' | 'email' | 'whatsapp' | 'custom';
  href?: string;
};

type ProductEnquiryActionsProps = {
  productName: string;
  productSlug?: string;
  productUrl?: string;
  quickLinks?: QuickLink[];
  fallbackPhone?: string;
  fallbackWhatsapp?: string;
  fallbackEmail?: string;
  className?: string;
};

export function ProductEnquiryActions({
  productName,
  productSlug,
  productUrl,
  quickLinks,
  fallbackPhone = '+919711196735',
  fallbackWhatsapp = '+919711196735',
  fallbackEmail = 'dnr.techservices@gmail.com',
  className = '',
}: ProductEnquiryActionsProps) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const phoneHref = useMemo(() => {
    const phoneLink = quickLinks?.find((item) => item.type === 'phone' && item.value);
    return phoneLink?.href || (phoneLink?.value ? `tel:${phoneLink.value}` : `tel:${fallbackPhone}`);
  }, [fallbackPhone, quickLinks]);

  const whatsappHref = useMemo(() => {
    const whatsappLink = quickLinks?.find((item) => item.type === 'whatsapp' && item.value);
    const whatsappValue = whatsappLink?.value || fallbackWhatsapp;
    const baseHref = whatsappLink?.href || `https://wa.me/${normalizeWhatsappNumber(whatsappValue)}`;
    const text = encodeURIComponent(`Hi DNR Techno Services, I am interested in ${productName}. Please share details.`);
    const separator = baseHref.includes('?') ? '&' : '?';
    return `${baseHref}${separator}text=${text}`;
  }, [fallbackWhatsapp, productName, quickLinks]);

  return (
    <>
      <div className={`flex flex-wrap gap-3 ${className}`}>
        <button type="button" onClick={() => setIsEnquiryOpen(true)} className="btn-primary text-sm">
          Enquire Now
        </button>
        <a href={phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-secondary/15 bg-white px-5 text-sm font-semibold text-secondary transition hover:border-primary/35 hover:text-primary">
          <PhoneCall size={16} aria-hidden="true" />
          Call
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-secondary/15 bg-white px-5 text-sm font-semibold text-secondary transition hover:border-primary/35 hover:text-primary"
        >
          <MessageCircle size={16} aria-hidden="true" />
          WhatsApp
        </a>
      </div>

      <ProductEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        productName={productName}
        productSlug={productSlug}
        productUrl={productUrl}
        quickLinks={quickLinks}
        fallbackPhone={fallbackPhone}
        fallbackWhatsapp={fallbackWhatsapp}
        fallbackEmail={fallbackEmail}
      />
    </>
  );
}
