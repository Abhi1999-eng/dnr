"use client";

import { useMemo, useState } from 'react';
import { SectionTitle } from './SectionTitle';
import { Reveal } from './Reveal';
import { simplemapsIndiaMapinfo } from '@/lib/simplemaps-india';
import { SUPPORTED_COVERAGE_STATES } from '@/lib/coverage-config';

const MAP_NAMES = simplemapsIndiaMapinfo.names as Record<string, string>;
const MAP_PATHS = simplemapsIndiaMapinfo.paths as Record<string, string>;
const MAP_BBOX = simplemapsIndiaMapinfo.state_bbox_array as Record<
  string,
  { cx: string | number; cy: string | number; x: number; x2: number; y: number; y2: number }
>;

function slugifyState(value?: string | null) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const INPUT_NORMALIZATION: Record<string, string> = {
  'andhra pradesh': 'Andhra Pradesh',
  gujarat: 'Gujarat',
  haryana: 'Haryana',
  jammu: 'Jammu and Kashmir',
  'jammu and kashmir': 'Jammu and Kashmir',
  'west bengal': 'West Bengal',
  kolkata: 'West Bengal',
  'kolkata west bengal': 'West Bengal',
  'kolkata / west bengal': 'West Bengal',
  'madhya pradesh': 'Madhya Pradesh',
  maharashtra: 'Maharashtra',
  'new delhi': 'Delhi',
  delhi: 'Delhi',
  'delhi ncr': 'Delhi',
  punjab: 'Punjab',
  rajasthan: 'Rajasthan',
  telangana: 'Telangana',
  'uttar pradesh': 'Uttar Pradesh',
  uttarakhand: 'Uttarakhand',
  uttaranchal: 'Uttarakhand',
  bihar: 'Bihar',
  chhattisgarh: 'Chhattisgarh',
  goa: 'Goa',
  'himachal pradesh': 'Himachal Pradesh',
  jharkhand: 'Jharkhand',
  karnataka: 'Karnataka',
  kerala: 'Kerala',
  odisha: 'Odisha',
  orissa: 'Odisha',
  'tamil nadu': 'Tamil Nadu',
};

function canonicalFromInput(value: string) {
  return INPUT_NORMALIZATION[slugifyState(value)];
}

function canonicalFromMapName(value: string) {
  const normalized = slugifyState(value);
  return INPUT_NORMALIZATION[normalized] || value;
}

type CoverageProps = {
  states: string[];
  title?: string;
  kicker?: string;
  summaryTitle?: string;
  summaryText?: string;
  stateDescriptions?: Record<string, string>;
  stateLabels?: Record<string, string>;
};

export function Coverage({
  states,
  title = 'Pan-India coverage',
  kicker = 'Coverage across key manufacturing belts, with install, service, and partner support where DNR customers operate.',
  summaryTitle = 'Coverage network',
  summaryText = 'DNR supports installs, service calls, and partner-led response where customers run foundry, machining, automation, and industrial engineering operations.',
  stateDescriptions = {},
  stateLabels = {},
}: CoverageProps) {
  const activeEntries = useMemo(() => {
    const canonicalSet = new Set(states.map(canonicalFromInput).filter(Boolean));

    return SUPPORTED_COVERAGE_STATES.map((item) => {
      if (!canonicalSet.has(item.mapName)) return null;

      const id = Object.entries(MAP_NAMES).find(([, name]) => canonicalFromMapName(name) === item.mapName)?.[0];
      if (!id || !MAP_PATHS[id] || !MAP_BBOX[id]) return null;

      const bbox = MAP_BBOX[id];
      return {
        id,
        mapName: item.mapName,
        uiLabel: stateLabels[item.mapName] || item.defaultLabel,
        description: stateDescriptions[item.mapName] || item.defaultDescription,
        path: MAP_PATHS[id],
        bbox,
      };
    }).filter(Boolean) as Array<{
      id: string;
      mapName: string;
      uiLabel: string;
      description: string;
      path: string;
        bbox: { cx: string | number; cy: string | number; x: number; x2: number; y: number; y2: number };
      }>;
  }, [stateDescriptions, stateLabels, states]);

  const [activeStateId, setActiveStateId] = useState(activeEntries[0]?.id ?? '');

  const activeState = activeEntries.find((entry) => entry.id === activeStateId) || activeEntries[0];

  return (
    <section id="coverage" className="container-wide mt-12 space-y-5">
      <SectionTitle title={title} kicker={kicker} />

      <Reveal>
        <div className="rounded-[1.7rem] border border-secondary/10 bg-[linear-gradient(135deg,#ffffff,rgba(246,248,250,0.98),rgba(237,245,228,0.82))] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
          <div className="rounded-[1.25rem] border border-secondary/10 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.07)] md:p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/70">Coverage map</p>
                <p className="text-base font-semibold text-secondary">SimpleMaps India layer with live state highlighting</p>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-secondary">
                {activeEntries.length} active states
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.25rem] border border-secondary/10 bg-[radial-gradient(circle_at_top,#f4f8ef,transparent_48%),linear-gradient(180deg,#ffffff,#f6f7f3)] p-4">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(135,225,38,0.08),transparent_40%,rgba(24,32,45,0.04))]" />
              <svg viewBox="0 0 1000 1000" className="relative z-10 h-full w-full" role="img" aria-labelledby="coverage-map-title">
                <title id="coverage-map-title">India coverage map</title>
                {Object.entries(MAP_PATHS).map(([id, path], index) => {
                  const isCovered = activeEntries.some((entry) => entry.id === id);
                  const isActive = activeStateId === id;

                  return (
                    <path
                      key={id}
                      d={path}
                      fill={
                        isActive ? '#87E126' : isCovered ? 'rgba(135, 225, 38, 0.78)' : 'rgba(203, 209, 219, 0.34)'
                      }
                      stroke={isCovered ? 'rgba(20, 28, 38, 0.30)' : 'rgba(20, 28, 38, 0.12)'}
                      strokeWidth={isActive ? 3 : 1.6}
                      className={isCovered ? 'cursor-pointer transition-colors duration-200 ease-out' : 'transition-colors duration-200 ease-out'}
                      onMouseEnter={isCovered ? () => setActiveStateId(id) : undefined}
                      onClick={isCovered ? () => setActiveStateId(id) : undefined}
                    />
                  );
                })}
              </svg>

              {activeState && (
                <div
                  key={activeState.id}
                  className="pointer-events-none absolute z-20 rounded-2xl border border-secondary/10 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur transition-all duration-200"
                  style={{
                    left: `${Math.min(82, Math.max(10, (Number(activeState.bbox.cx) / 1000) * 100))}%`,
                    top: `${Math.min(82, Math.max(12, (Number(activeState.bbox.cy) / 1000) * 100 - 8))}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/70">Active state</p>
                  <p className="text-[13px] font-semibold text-secondary">{activeState.uiLabel}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[1.25rem] border border-secondary/10 bg-[linear-gradient(180deg,#1b2430,#141b24)] px-4 py-4 text-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">{summaryTitle}</p>
              <h3 className="mt-2 text-xl font-semibold">Rapid response across manufacturing hubs</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/88">{summaryText}</p>
              {activeState && (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-3.5 py-2.5">
                  <p className="text-[13px] font-semibold text-white">{activeState.uiLabel}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/88">{activeState.description}</p>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:max-h-[32rem] lg:overflow-auto lg:pr-1">
              {activeEntries.length ? activeEntries.map((entry) => {
                const isActive = entry.id === activeStateId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onMouseEnter={() => setActiveStateId(entry.id)}
                    onFocus={() => setActiveStateId(entry.id)}
                    onClick={() => setActiveStateId(entry.id)}
                    className={`rounded-2xl border px-3.5 py-2.5 text-left transition duration-200 ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/15'
                        : 'border-secondary/10 bg-white/90 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-secondary/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isActive ? 'bg-primary' : 'bg-secondary/30'}`} />
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-secondary">{entry.uiLabel}</p>
                        <p className="text-xs leading-relaxed text-secondary/80">{entry.description}</p>
                      </div>
                    </div>
                  </button>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-secondary/15 bg-white px-4 py-5 text-sm leading-relaxed text-secondary/80 sm:col-span-2">
                  No states are active right now. The map is still visible so you can enable support coverage from the admin panel whenever needed.
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
