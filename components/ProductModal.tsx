import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DescriptionBlock } from './DescriptionBlock';
import type { ProductType } from '@/types';

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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-[95%] grid md:grid-cols-[1.1fr,0.9fr] gap-6 p-6 relative overflow-hidden"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="absolute top-4 right-4 text-secondary hover:text-primary" onClick={onClose} aria-label="Close">
            <X />
          </button>
          <div className="relative min-h-[260px] rounded-xl overflow-hidden bg-muted border border-muted/60">
            <div
              className="absolute inset-0 transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              {(() => {
                const imgSrc = product.heroImage || product.image || '/dnr/page_06.png';
                return (
              <Image
                  src={imgSrc}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
                );
              })()}
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow">
              <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="text-secondary hover:text-primary" aria-label="Zoom in">
                <ZoomIn size={18} />
              </button>
              <button onClick={() => setZoom((z) => Math.max(z - 0.25, 1))} className="text-secondary hover:text-primary" aria-label="Zoom out">
                <ZoomOut size={18} />
              </button>
              <button onClick={() => setZoom(1)} className="text-secondary hover:text-primary" aria-label="Reset zoom">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
