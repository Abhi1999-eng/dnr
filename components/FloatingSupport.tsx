'use client';
import Image from 'next/image';

export function FloatingSupport() {
  return (
    <a
      href="https://wa.me/919711196735"
      className="flex items-center justify-center fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/30 animate-pulse-soft"
      aria-label="24/7 Support on WhatsApp"
      target="_blank"
      rel="noreferrer"
    >
        <Image src="/whatsapp-svgrepo-com.svg" alt="WhatsApp" fill className="object-contain" />
    </a>
  );
}
