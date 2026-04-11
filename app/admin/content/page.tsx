'use client';
import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminContentPage() {
  const { data, mutate } = useSWR('/api/content', fetcher);
  const [hero, setHero] = useState({ title: '', subtitle: '', cta: '' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

  useEffect(() => {
    if (!data?.hero) return;
    // Sync fetched hero content into form state when data changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHero(data.hero);
  }, [data?.hero]);

  async function saveHero() {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ key: 'hero', data: hero }),
    });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Content</h1>
        <div className="glass p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="grid gap-3">
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Hero title"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Hero subtitle"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Hero CTA"
              value={hero.cta}
              onChange={(e) => setHero({ ...hero, cta: e.target.value })}
            />
          </div>
          <button onClick={saveHero} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
            Save hero
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
