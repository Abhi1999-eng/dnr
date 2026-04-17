'use client';

import Image from 'next/image';

type FloatingSupportProps = {
  enabled?: boolean;
  whatsappNumber?: string;
  label?: string;
};

export function FloatingSupport({ enabled = true, whatsappNumber = '', label = 'WhatsApp Support' }: FloatingSupportProps) {
  if (!enabled || !whatsappNumber) return null;

  const normalized = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <a
      href={`https://wa.me/${normalized}`}
      className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-secondary shadow-lg shadow-primary/30 transition hover:-translate-y-1"
      aria-label={label}
      target="_blank"
      rel="noreferrer"
    >
      <span className="relative h-6 w-6">
        <Image src="/whatsapp-svgrepo-com.svg" alt="WhatsApp" fill className="object-contain" />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
