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
  theme?: 'light' | 'dark';
};

export function Coverage({
  states,
  title = 'Pan-India coverage',
  kicker = 'Coverage across key manufacturing belts, with install, service, and partner support where DNR customers operate.',
  summaryTitle = 'Coverage network',
  summaryText = 'DNR supports installs, service calls, and partner-led response where customers run foundry, machining, automation, and industrial engineering operations.',
  stateDescriptions = {},
  stateLabels = {},
  theme = 'light',
}: CoverageProps) {
  const isDark = theme === 'dark';
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
    <section id="coverage" className="container-wide mt-10 space-y-4">
      <SectionTitle title={title} kicker={kicker} theme={theme} eyebrow={isDark ? 'Pan-India service' : undefined} />

      <Reveal>
        <div className={`rounded-[1.5rem] border p-4 md:p-5 ${isDark ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(135deg,#101820,rgba(11,18,24,0.98),rgba(18,28,34,0.94))] shadow-[0_22px_54px_rgba(0,0,0,0.28)]' : 'border-secondary/10 bg-[linear-gradient(135deg,#ffffff,rgba(246,248,250,0.98),rgba(237,245,228,0.82))] shadow-[0_18px_48px_rgba(15,23,42,0.08)]'}`}>
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className={`rounded-[1.15rem] border p-3.5 md:p-4 ${isDark ? 'border-[rgba(126,211,33,0.12)] bg-[#111b24]/95 shadow-[0_18px_40px_rgba(0,0,0,0.24)]' : 'border-secondary/10 bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.07)]'}`}>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div>
                <p className={isDark ? 'text-xs font-semibold uppercase tracking-[0.22em] text-[#d5f4a8]' : 'text-xs font-semibold uppercase tracking-[0.22em] text-secondary/70'}>Coverage map</p>
                <p className={isDark ? 'text-base font-semibold text-white' : 'text-base font-semibold text-secondary'}>SimpleMaps India layer with live state highlighting</p>
              </div>
              <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? 'border-[#7ed321]/18 bg-[#7ed321]/10 text-[#d5f4a8]' : 'border-primary/20 bg-primary/10 text-secondary'}`}>
                {activeEntries.length} active states
              </div>
            </div>

            <div className={`relative overflow-hidden rounded-[1.15rem] border p-3 ${isDark ? 'border-[rgba(126,211,33,0.12)] bg-[radial-gradient(circle_at_top,rgba(126,211,33,0.12),transparent_45%),linear-gradient(180deg,#0d161d,#111b24)]' : 'border-secondary/10 bg-[radial-gradient(circle_at_top,#f4f8ef,transparent_48%),linear-gradient(180deg,#ffffff,#f6f7f3)]'}`}>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(135,225,38,0.12),transparent_40%,rgba(24,32,45,0.04))]" />
              <svg viewBox="0 0 1000 1000" className="relative z-10 h-full max-h-[400px] w-full md:max-h-[430px] lg:max-h-[450px]" role="img" aria-labelledby="coverage-map-title">
                <title id="coverage-map-title">India coverage map</title>
                {Object.entries(MAP_PATHS).map(([id, path], index) => {
                  const isCovered = activeEntries.some((entry) => entry.id === id);
                  const isActive = activeStateId === id;

                  return (
                    <path
                      key={id}
                      d={path}
                      fill={
                        isActive
                          ? '#87E126'
                          : isCovered
                            ? 'rgba(135, 225, 38, 0.78)'
                            : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(203, 209, 219, 0.34)'
                      }
                      stroke={
                        isCovered
                          ? isDark
                            ? 'rgba(255,255,255,0.12)'
                            : 'rgba(20, 28, 38, 0.30)'
                          : isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(20, 28, 38, 0.12)'
                      }
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
                  className={`pointer-events-none absolute z-20 rounded-2xl border px-3.5 py-2.5 shadow-lg backdrop-blur transition-all duration-200 ${isDark ? 'border-[#7ed321]/16 bg-[#111b24]/95 text-white' : 'border-secondary/10 bg-white/95 text-secondary'}`}
                  style={{
                    left: `${Math.min(80, Math.max(12, (Number(activeState.bbox.cx) / 1000) * 100))}%`,
                    top: `${Math.min(82, Math.max(12, (Number(activeState.bbox.cy) / 1000) * 100 - 8))}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <p className={isDark ? 'text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]' : 'text-xs font-semibold uppercase tracking-[0.18em] text-secondary/70'}>Active state</p>
                  <p className={isDark ? 'text-[13px] font-semibold text-white' : 'text-[13px] font-semibold text-secondary'}>{activeState.uiLabel}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className={`rounded-[1.15rem] border px-3.5 py-3.5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.22)] ${isDark ? 'border-[rgba(126,211,33,0.16)] bg-[linear-gradient(180deg,#151f28,#0d141b)]' : 'border-secondary/10 bg-[linear-gradient(180deg,#1b2430,#141b24)]'}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">{summaryTitle}</p>
              <h3 className="mt-1.5 text-lg font-semibold">Rapid response across manufacturing hubs</h3>
              <p className="mt-1.5 text-xs leading-6 text-white/88">{summaryText}</p>
              {activeState && (
                <div className={`mt-2.5 rounded-2xl border px-3 py-2 ${isDark ? 'border-[#7ed321]/14 bg-white/5' : 'border-white/10 bg-white/10'}`}>
                  <p className="text-[13px] font-semibold text-white">{activeState.uiLabel}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/88">{activeState.description}</p>
                </div>
              )}
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:max-h-[27rem] lg:overflow-auto lg:pr-1">
              {activeEntries.length ? activeEntries.map((entry) => {
                const isActive = entry.id === activeStateId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onMouseEnter={() => setActiveStateId(entry.id)}
                    onFocus={() => setActiveStateId(entry.id)}
                    onClick={() => setActiveStateId(entry.id)}
                    className={`rounded-2xl border px-3 py-2 text-left transition duration-200 ${
                      isActive
                        ? isDark
                          ? 'border-[#7ed321]/40 bg-[#7ed321]/10 shadow-md shadow-[#7ed321]/10'
                          : 'border-primary bg-primary/10 shadow-md shadow-primary/15'
                        : isDark
                          ? 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-[#7ed321]/35 hover:shadow-md hover:shadow-black/20'
                          : 'border-secondary/10 bg-white/90 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-secondary/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isActive ? 'bg-primary' : 'bg-secondary/30'}`} />
                      <div className="space-y-1">
                        <p className={isDark ? 'text-[13px] font-semibold text-white' : 'text-[13px] font-semibold text-secondary'}>{entry.uiLabel}</p>
                        <p className={isDark ? 'text-xs leading-relaxed text-[#aab4bd]' : 'text-xs leading-relaxed text-secondary/80'}>{entry.description}</p>
                      </div>
                    </div>
                  </button>
                );
              }) : (
                <div className={`rounded-2xl border border-dashed px-4 py-4 text-sm leading-relaxed sm:col-span-2 ${isDark ? 'border-white/14 bg-white/[0.03] text-[#aab4bd]' : 'border-secondary/15 bg-white text-secondary/80'}`}>
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
