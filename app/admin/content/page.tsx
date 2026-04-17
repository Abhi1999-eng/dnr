'use client';

import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const defaultHero = { title: '', subtitle: '', cta: '' };

export default function AdminContentPage() {
  const { data, mutate } = useSWR('/api/content', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<typeof defaultHero | null>(null);

  const hero = draft ?? { ...defaultHero, ...(data?.hero || {}) };

  async function saveHero() {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ key: 'hero', data: hero }),
    });
    setDraft(null);
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Legacy Content</h1>
          <p className="text-sm text-slate-400">This screen keeps the older hero content store editable for compatibility while the main homepage CMS lives under Homepage.</p>
        </div>
        <div className="glass space-y-3 rounded-2xl border border-white/10 p-5">
          <div className="grid gap-3">
            <input placeholder="Hero title" value={hero.title} onChange={(e) => setDraft({ ...hero, title: e.target.value })} />
            <input placeholder="Hero subtitle" value={hero.subtitle} onChange={(e) => setDraft({ ...hero, subtitle: e.target.value })} />
            <input placeholder="Hero CTA" value={hero.cta} onChange={(e) => setDraft({ ...hero, cta: e.target.value })} />
          </div>
          <button onClick={saveHero} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            Save hero content
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
