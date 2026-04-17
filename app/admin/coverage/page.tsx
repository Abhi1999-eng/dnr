'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { SUPPORTED_COVERAGE_STATES } from '@/lib/coverage-config';
import { AdminFeedback } from '@/components/AdminFeedback';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CoverageState = { stateId: string; label: string; description: string; active?: boolean; sortOrder?: number };

const defaultCoverage = {
  sections: {
    coverage: {
      title: 'Pan-India coverage',
      kicker: '',
      summaryTitle: 'Coverage network',
      summaryText: '',
    },
  },
  coverageStates: [] as CoverageState[],
};

function normalizeCoverageStates(states: CoverageState[] = []) {
  const byId = new Map(states.map((item) => [item.stateId, item]));
  return SUPPORTED_COVERAGE_STATES.map((state, index) => ({
    stateId: state.mapName,
    label: byId.get(state.mapName)?.label || state.defaultLabel,
    description: byId.get(state.mapName)?.description || state.defaultDescription,
    active: byId.get(state.mapName)?.active !== false,
    sortOrder: byId.get(state.mapName)?.sortOrder || index + 1,
  }));
}

function normalizeCoverage(data: any) {
  if (!data) {
    return {
      sections: defaultCoverage.sections,
      coverageStates: normalizeCoverageStates(),
    };
  }

  return {
    sections: {
      coverage: {
        ...defaultCoverage.sections.coverage,
        ...(data.sections?.coverage || {}),
      },
    },
    coverageStates: normalizeCoverageStates(data.coverageStates || []),
  };
}

export default function AdminCoveragePage() {
  const { data, mutate } = useSWR('/api/homepage', fetcher);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<ReturnType<typeof normalizeCoverage> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useMemo(() => draft ?? normalizeCoverage(data), [data, draft]);

  function updateState(index: number, patch: Partial<CoverageState>) {
    setDraft({
      ...form,
      coverageStates: form.coverageStates.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...data,
        sections: {
          ...(data?.sections || {}),
          coverage: {
            ...(data?.sections?.coverage || {}),
            ...form.sections.coverage,
            visible: true,
          },
        },
        coverageStates: form.coverageStates.map((item, index) => ({
          ...item,
          sortOrder: index + 1,
        })),
      };

      const res = await fetch('/api/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save coverage settings');
      }

      setDraft(null);
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: 'Coverage settings updated successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save coverage settings' });
    } finally {
      setSaving(false);
    }
  }

  const activeCount = form.coverageStates.filter((state) => state.active !== false).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Coverage Settings</h1>
          <p className="text-sm text-slate-400">The India map always stays visible on the website. Use this page to choose which states are highlighted and what text appears beside the map.</p>
        </div>
        {feedback ? <AdminFeedback type={feedback.type} message={feedback.message} /> : null}

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Coverage section text</h2>
            <p className="text-sm text-slate-400">These fields control the title and support summary shown above and beside the map.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Section title</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                value={form.sections.coverage.title}
                onChange={(e) =>
                  setDraft({
                    ...form,
                    sections: { coverage: { ...form.sections.coverage, title: e.target.value } },
                  })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Summary card title</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                value={form.sections.coverage.summaryTitle}
                onChange={(e) =>
                  setDraft({
                    ...form,
                    sections: { coverage: { ...form.sections.coverage, summaryTitle: e.target.value } },
                  })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Section subtitle</span>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                value={form.sections.coverage.kicker}
                onChange={(e) =>
                  setDraft({
                    ...form,
                    sections: { coverage: { ...form.sections.coverage, kicker: e.target.value } },
                  })
                }
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Summary card description</span>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                value={form.sections.coverage.summaryText}
                onChange={(e) =>
                  setDraft({
                    ...form,
                    sections: { coverage: { ...form.sections.coverage, summaryText: e.target.value } },
                  })
                }
              />
            </label>
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Active coverage states</h2>
              <p className="text-sm text-slate-400">Add the states where your company provides service or support by switching them on below.</p>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-white">
              {activeCount} states active
            </div>
          </div>

          <div className="space-y-3">
            {form.coverageStates.map((state, index) => (
              <div key={state.stateId} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[180px_1fr_1.4fr]">
                <label className="flex items-center gap-3 text-sm font-medium text-white">
                  <input
                    type="checkbox"
                    checked={state.active !== false}
                    onChange={(e) => updateState(index, { active: e.target.checked })}
                  />
                  <span>{SUPPORTED_COVERAGE_STATES[index]?.defaultLabel || state.label}</span>
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Display label</span>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                    value={state.label}
                    onChange={(e) => updateState(index, { label: e.target.value })}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Short description</span>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2"
                    value={state.description}
                    onChange={(e) => updateState(index, { description: e.target.value })}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? 'Saving…' : 'Save coverage settings'}
        </button>
      </div>
    </AdminShell>
  );
}
