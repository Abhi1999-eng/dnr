"use client";

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import Image from 'next/image';

type CoveragePoint = {
  key: string;
  label: string;
  x: number; // percent
  y: number; // percent
  region?: string;
};

const MAP_POINTS: Record<string, CoveragePoint & { offsetX?: number; offsetY?: number }> = {
  jammu: { key: 'jammu', label: 'Jammu', x: 47, y: 8, region: 'Jammu & Kashmir', offsetY: -12 },
  'himachal pradesh': { key: 'himachal pradesh', label: 'Himachal Pradesh', x: 48, y: 14, offsetY: -8 },
  punjab: { key: 'punjab', label: 'Punjab', x: 44, y: 18, offsetY: -6 },
  haryana: { key: 'haryana', label: 'Haryana', x: 48, y: 22, offsetY: -6 },
  'new delhi': { key: 'new delhi', label: 'Delhi NCR', x: 49, y: 25, offsetY: -10 },
  uttarakhand: { key: 'uttarakhand', label: 'Uttarakhand', x: 52, y: 20, offsetY: -8 },
  'uttar pradesh': { key: 'uttar pradesh', label: 'Uttar Pradesh', x: 58, y: 30, offsetY: -4 },
  rajasthan: { key: 'rajasthan', label: 'Rajasthan', x: 38, y: 35, offsetY: -2 },
  gujarat: { key: 'gujarat', label: 'Gujarat', x: 30, y: 47 },
  'madhya pradesh': { key: 'madhya pradesh', label: 'Madhya Pradesh', x: 52, y: 45 },
  maharashtra: { key: 'maharashtra', label: 'Maharashtra', x: 50, y: 60, offsetY: 2 },
  telangana: { key: 'telangana', label: 'Telangana', x: 56, y: 58, offsetY: 2 },
  'andhra pradesh': { key: 'andhra pradesh', label: 'Andhra Pradesh', x: 62, y: 68, offsetY: 10 },
  kolkata: { key: 'kolkata', label: 'Kolkata / West Bengal', x: 74, y: 40, region: 'West Bengal', offsetX: 10, offsetY: -4 },
  'west bengal': { key: 'west bengal', label: 'West Bengal', x: 72, y: 42, offsetX: 8 },
  bihar: { key: 'bihar', label: 'Bihar', x: 64, y: 34, offsetY: -6 },
  chhattisgarh: { key: 'chhattisgarh', label: 'Chhattisgarh', x: 62, y: 50 },
  goa: { key: 'goa', label: 'Goa', x: 46, y: 68, offsetY: 10 },
  jharkhand: { key: 'jharkhand', label: 'Jharkhand', x: 66, y: 40, offsetY: -2 },
  karnataka: { key: 'karnataka', label: 'Karnataka', x: 52, y: 72, offsetY: 4 },
  kerala: { key: 'kerala', label: 'Kerala', x: 50, y: 82, offsetY: 10 },
  odisha: { key: 'odisha', label: 'Odisha', x: 69, y: 52, offsetY: 2 },
  'tamil nadu': { key: 'tamil nadu', label: 'Tamil Nadu', x: 58, y: 86, offsetY: 12 },
};

const indiaPath =
  'M140 10 160 40 150 60 165 80 160 100 175 120 170 140 150 170 145 200 130 220 115 240 100 260 90 280 70 300 60 320 50 340 40 360 60 360 80 350 100 340 120 330 140 320 150 300 165 280 170 260 185 240 200 220 210 200 220 180 230 160 240 140 245 120 240 100 230 80 210 60 190 50 180 40 170 20 Z';

function normalizeKey(name: string) {
  return name.toLowerCase().trim();
}

export function Coverage({ states }: { states: string[] }) {
  const mapped = useMemo(() => {
    return states.map((s) => {
      const key = normalizeKey(s);
      return MAP_POINTS[key] || { key, label: s, x: 55, y: 55 };
    });
  }, [states]);

  const [activeKey, setActiveKey] = useState<string>(mapped[0]?.key || '');

  return (
    <section id="coverage" className="container-wide mt-16 space-y-8">
      <SectionTitle title="Pan-India coverage" kicker="Rapid response, installs, service, and partner support across key hubs." />
      <p className="text-xs text-secondary/60">Debug: rendering {mapped.length} coverage locations</p>
      <div className="rounded-3xl border border-secondary/10 bg-gradient-to-br from-white via-muted/40 to-white p-6 md:p-8 shadow-xl shadow-secondary/10">
        <div className="grid lg:grid-cols-[1.2fr,0.9fr] gap-8 items-center">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-secondary/10 shadow-lg shadow-secondary/15">
            <Image
              src="/india-map.png"
              alt="India coverage map"
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
            {/* markers */}
            <div className="absolute inset-6">
              <AnimatePresence>
                {mapped.map((p, idx) => {
                  const active = activeKey === p.key;
                  const labelX = p.offsetX ?? 0;
                  const labelY = p.offsetY ?? -14;
                  return (
                    <motion.button
                      key={p.key}
                      className="group absolute"
                      style={{ top: `${p.y}%`, left: `${p.x}%`, transform: 'translate(-50%, -50%)' }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1, transition: { delay: idx * 0.04, type: 'spring', stiffness: 240, damping: 18 } }}
                      whileHover={{ scale: 1.08 }}
                      onMouseEnter={() => setActiveKey(p.key)}
                      onFocus={() => setActiveKey(p.key)}
                      onClick={() => setActiveKey(p.key)}
                    >
                      <span
                        className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                          active ? 'border-primary bg-white shadow-lg shadow-primary/40' : 'border-secondary/20 bg-white shadow-md'
                        }`}
                      >
                        <span
                          className={`absolute inset-0 rounded-full ${
                            active ? 'bg-primary/15 animate-ping' : 'bg-primary/10 opacity-60'
                          }`}
                        />
                        <span className="relative h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <motion.span
                        className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                          active ? 'bg-primary text-secondary' : 'bg-white/90 text-secondary border border-secondary/10 opacity-0'
                        }`}
                        style={{ transform: `translate(calc(-50% + ${labelX}px), ${labelY}px)` }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 4 }}
                        exit={{ opacity: 0, y: 6 }}
                      >
                        {p.label}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-secondary/10 bg-white p-4 shadow-md shadow-secondary/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary/60">Coverage network</p>
              <p className="text-lg font-semibold text-secondary">Install, service, and partner support across India</p>
              <p className="text-secondary/70 text-sm">Hover or tap a location to highlight its marker on the map.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {mapped.map((p) => {
                const active = activeKey === p.key;
                return (
                  <button
                    key={p.key}
                    onMouseEnter={() => setActiveKey(p.key)}
                    onFocus={() => setActiveKey(p.key)}
                    onClick={() => setActiveKey(p.key)}
                    className={`flex items-start gap-2 rounded-2xl border px-3 py-3 text-left transition shadow-sm ${
                      active
                        ? 'border-primary bg-primary/10 shadow-primary/20'
                        : 'border-secondary/10 bg-white hover:border-primary/40 hover:shadow-primary/10'
                    }`}
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-semibold text-secondary">{p.label}</p>
                      {p.region && <p className="text-xs text-secondary/60">{p.region}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
