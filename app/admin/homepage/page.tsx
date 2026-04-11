'use client';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminHomepagePage() {
  const { data, mutate } = useSWR('/api/homepage', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [hero, setHero] = useState({ heading: '', subheading: '', ctaPrimary: '', ctaSecondary: '', tagline: '' });
  const [about, setAbout] = useState({ heading: '', body: '', bullets: [] as string[] });
  const [why, setWhy] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setHero(data.hero || hero);
      setAbout(data.about || about);
      setWhy(data.why || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function save() {
    await fetch('/api/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ hero, about, why }),
    });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Homepage Content</h1>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-white font-semibold">Hero</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Heading" value={hero.heading} onChange={(e) => setHero({ ...hero, heading: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Subheading" value={hero.subheading} onChange={(e) => setHero({ ...hero, subheading: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Primary CTA" value={hero.ctaPrimary} onChange={(e) => setHero({ ...hero, ctaPrimary: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Secondary CTA" value={hero.ctaSecondary} onChange={(e) => setHero({ ...hero, ctaSecondary: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 md:col-span-2" placeholder="Tagline" value={hero.tagline} onChange={(e) => setHero({ ...hero, tagline: e.target.value })} />
          </div>
        </div>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-white font-semibold">About</h3>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Heading" value={about.heading} onChange={(e) => setAbout({ ...about, heading: e.target.value })} />
          <textarea className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" rows={3} placeholder="Body" value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} />
          <textarea
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            rows={3}
            placeholder="Bullets (one per line)"
            value={about.bullets.join('\\n')}
            onChange={(e) => setAbout({ ...about, bullets: e.target.value.split('\\n').filter(Boolean) })}
          />
        </div>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-white font-semibold">Why choose</h3>
          <textarea
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            rows={3}
            placeholder="One reason per line"
            value={why.join('\\n')}
            onChange={(e) => setWhy(e.target.value.split('\\n').filter(Boolean))}
          />
        </div>
        <button onClick={save} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
          Save content
        </button>
      </div>
    </AdminShell>
  );
}
