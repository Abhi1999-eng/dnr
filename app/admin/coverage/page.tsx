'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CoverageState = { stateId: string; label: string; description: string; active?: boolean; sortOrder?: number };

const defaultCoverage = {
  sections: {
    coverage: {
      visible: true,
      title: 'Pan-India coverage',
      kicker: '',
      summaryTitle: 'Coverage network',
      summaryText: '',
    },
  },
  coverageStates: [] as CoverageState[],
};

function normalizeCoverage(data: any) {
  if (!data) return defaultCoverage;
  return {
    sections: {
      coverage: {
        ...defaultCoverage.sections.coverage,
        ...(data.sections?.coverage || {}),
      },
    },
    coverageStates: data.coverageStates || [],
  };
}

export default function AdminCoveragePage() {
  const { data, mutate } = useSWR('/api/homepage', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<typeof defaultCoverage | null>(null);

  const form = draft ?? normalizeCoverage(data);

  async function save() {
    const payload = {
      ...data,
      sections: {
        ...(data?.sections || {}),
        coverage: form.sections.coverage,
      },
      coverageStates: form.coverageStates,
    };

    await fetch('/api/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(payload),
    });
    setDraft(null);
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Coverage Settings</h1>
          <p className="text-sm text-slate-400">Manage the visible title, summary, and business-facing content for map-linked coverage states.</p>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.sections.coverage.visible}
                onChange={(e) =>
                  setDraft({
                    ...form,
                    sections: { coverage: { ...form.sections.coverage, visible: e.target.checked } },
                  })
                }
              />
              Show coverage section
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Section title" value={form.sections.coverage.title} onChange={(e) => setDraft({ ...form, sections: { coverage: { ...form.sections.coverage, title: e.target.value } } })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Summary title" value={form.sections.coverage.summaryTitle} onChange={(e) => setDraft({ ...form, sections: { coverage: { ...form.sections.coverage, summaryTitle: e.target.value } } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={2} placeholder="Section subtitle" value={form.sections.coverage.kicker} onChange={(e) => setDraft({ ...form, sections: { coverage: { ...form.sections.coverage, kicker: e.target.value } } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Summary text" value={form.sections.coverage.summaryText} onChange={(e) => setDraft({ ...form, sections: { coverage: { ...form.sections.coverage, summaryText: e.target.value } } })} />
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Coverage state cards</h2>
          <textarea
            className="min-h-[24rem] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            placeholder="stateId|label|description|sortOrder|active one per line"
            value={form.coverageStates.map((item: CoverageState) => [item.stateId, item.label, item.description, item.sortOrder || 0, item.active !== false ? 'true' : 'false'].join('|')).join('\n')}
            onChange={(e) =>
              setDraft({
                ...form,
                coverageStates: e.target.value
                  .split('\n')
                  .map((line: string) => {
                    const [stateId, label, description, sortOrder, active] = line.split('|').map((part) => part.trim());
                    if (!stateId || !label) return null;
                    return {
                      stateId,
                      label,
                      description: description || '',
                      sortOrder: Number(sortOrder || 0),
                      active: active !== 'false',
                    };
                  })
                  .filter(Boolean) as typeof form.coverageStates,
              })
            }
          />
        </div>

        <button onClick={save} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
          Save coverage content
        </button>
      </div>
    </AdminShell>
  );
}
