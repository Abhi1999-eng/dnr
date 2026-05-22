import { X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DescriptionBlock } from './DescriptionBlock';
import { ManagedImage } from './ManagedImage';
import { ProductEnquiryActions } from './ProductEnquiryActions';
import type { ProductType } from '@/types';
import { resolveProductImage } from '@/lib/media';

type QuickLink = {
  label: string;
  value?: string;
  type?: 'phone' | 'email' | 'whatsapp' | 'custom';
  href?: string;
};

export function ProductModal({
  product,
  onClose,
  quickLinks,
  fallbackPhone,
  fallbackWhatsapp,
  fallbackEmail,
}: {
  product: ProductType;
  onClose: () => void;
  quickLinks?: QuickLink[];
  fallbackPhone?: string;
  fallbackWhatsapp?: string;
  fallbackEmail?: string;
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative grid w-[95%] max-w-[1180px] gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.98),rgba(10,16,20,0.98))] p-6 text-white shadow-[0_32px_90px_rgba(0,0,0,0.42)] md:grid-cols-[1.15fr,0.85fr] md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
          <button className="absolute right-4 top-4 text-white/70 transition hover:text-[#7ed321]" onClick={onClose} aria-label="Close">
            <X />
          </button>
          <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0b1218] p-4 md:h-[520px] md:p-6">
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              {(() => {
                const imgSrc = resolveProductImage(product);
                return (
              <ManagedImage
                src={imgSrc}
                alt={product.title}
                width={1600}
                height={1200}
                className="max-h-full w-full object-contain object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
                );
              })()}
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#071014]/85 px-3 py-2 shadow-lg backdrop-blur">
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="touch-target text-white/75 transition hover:text-[#7ed321]" aria-label="Zoom in">
                <ZoomIn size={18} />
              </button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className="touch-target text-white/75 transition hover:text-[#7ed321]" aria-label="Zoom out">
                <ZoomOut size={18} />
              </button>
              <button onClick={() => setZoom(1)} className="touch-target text-white/75 transition hover:text-[#7ed321]" aria-label="Reset zoom">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-3 text-white">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d5f4a8]">Product details</span>
            </div>
            <h3 className="text-2xl font-semibold">{product.title}</h3>
            <DescriptionBlock content={product.shortDescription || product.description || ''} maxPreview={240} theme="dark" />
            {product.features?.length ? (
              <div>
                <p className="font-semibold text-white">Features</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {product.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {product.applications?.length ? (
              <div>
                <p className="font-semibold text-white">Applications</p>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((a) => (
                    <span key={a} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-slate-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {product.specs?.length ? (
              <div>
                <p className="font-semibold text-white">Specifications</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {product.specs.map((s, idx) => (
                    <div key={idx} className="flex justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                      <span>{s.label}</span>
                      <span className="font-semibold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="pt-2">
              <ProductEnquiryActions
                productName={product.title}
                productSlug={product.slug}
                productUrl={product.slug ? `/products/${product.slug}` : ''}
                quickLinks={quickLinks}
                fallbackPhone={fallbackPhone}
                fallbackWhatsapp={fallbackWhatsapp}
                fallbackEmail={fallbackEmail}
                theme="dark"
              />
            </div>
            <div className="flex gap-3">
              {product.slug && (
                <a href={`/products/${product.slug}`} className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white transition hover:border-[#7ed321]/35 hover:bg-[#7ed321]/8 hover:text-[#d5f4a8]">
                  View Full Product
                </a>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
