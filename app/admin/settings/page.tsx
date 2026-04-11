'use client';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminSettingsPage() {
  const { data, mutate } = useSWR('/api/settings', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [settings, setSettings] = useState({
    address: '',
    phone: [] as string[],
    email: '',
    website: '',
    mapLink: '',
    coverageStates: [] as string[],
    seo: { title: '', description: '', ogImage: '' },
  });

  useEffect(() => {
    if (data) setSettings({ ...settings, ...data, phone: data.phone || [], coverageStates: data.coverageStates || [], seo: data.seo || settings.seo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  async function save() {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(settings),
    });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Site settings</h1>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            placeholder="Phone numbers (comma separated)"
            value={settings.phone.join(', ')}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value.split(',').map((p) => p.trim()).filter(Boolean) })}
          />
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Website" value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} />
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Map link" value={settings.mapLink} onChange={(e) => setSettings({ ...settings, mapLink: e.target.value })} />
          <textarea
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            rows={3}
            placeholder="Coverage states (one per line)"
            value={settings.coverageStates.join('\\n')}
            onChange={(e) => setSettings({ ...settings, coverageStates: e.target.value.split('\\n').filter(Boolean) })}
          />
        </div>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <h3 className="text-white font-semibold">SEO</h3>
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Meta title" value={settings.seo.title} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, title: e.target.value } })} />
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Meta description" value={settings.seo.description} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, description: e.target.value } })} />
          <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="OG Image" value={settings.seo.ogImage} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, ogImage: e.target.value } })} />
        </div>
        <button onClick={save} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
          Save settings
        </button>
      </div>
    </AdminShell>
  );
}
