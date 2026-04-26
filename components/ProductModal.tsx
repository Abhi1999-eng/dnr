import { X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DescriptionBlock } from './DescriptionBlock';
import { ManagedImage } from './ManagedImage';
import type { ProductType } from '@/types';
import { resolveProductImage } from '@/lib/media';

export function ProductModal({ product, onClose }: { product: ProductType; onClose: () => void }) {
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
        className="relative grid w-[95%] max-w-[1180px] gap-6 overflow-hidden rounded-[28px] bg-white p-6 shadow-2xl md:grid-cols-[1.15fr,0.85fr] md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
          <button className="absolute top-4 right-4 text-secondary hover:text-primary" onClick={onClose} aria-label="Close">
            <X />
          </button>
          <div className="relative h-[320px] rounded-2xl overflow-hidden border border-muted/60 bg-slate-50 md:h-[500px]">
            <div
              className="absolute inset-0 transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              {(() => {
                const imgSrc = resolveProductImage(product);
                return (
              <ManagedImage
                  src={imgSrc}
                alt={product.title}
                fill
                className="object-contain object-center p-5 md:p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
                );
              })()}
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow">
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="touch-target text-secondary hover:text-primary" aria-label="Zoom in">
                <ZoomIn size={18} />
              </button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className="touch-target text-secondary hover:text-primary" aria-label="Zoom out">
                <ZoomOut size={18} />
              </button>
              <button onClick={() => setZoom(1)} className="touch-target text-secondary hover:text-primary" aria-label="Reset zoom">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-3 text-secondary">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded-full bg-muted border border-muted/80">Product details</span>
            </div>
            <h3 className="text-2xl font-semibold">{product.title}</h3>
            <DescriptionBlock content={product.description || product.shortDescription || ''} maxPreview={240} />
            {product.features?.length ? (
              <div>
                <p className="font-semibold">Features</p>
                <ul className="list-disc list-inside text-secondary/80 space-y-1">
                  {product.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {product.applications?.length ? (
              <div>
                <p className="font-semibold">Applications</p>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-muted border border-muted/70 text-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {product.specs?.length ? (
              <div>
                <p className="font-semibold">Specifications</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {product.specs.map((s, idx) => (
                    <div key={idx} className="flex justify-between bg-muted px-3 py-2 rounded-lg text-sm">
                      <span>{s.label}</span>
                      <span className="font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex gap-3 pt-2">
              <a href="#contact" className="btn-primary text-sm">
                Enquire Now
              </a>
              {product.slug && (
                <a href={`/products/${product.slug}`} className="btn-ghost text-sm">
                  View Full Product
                </a>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
