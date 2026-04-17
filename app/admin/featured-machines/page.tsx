'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';
import { AdminFeedback } from '@/components/AdminFeedback';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type MachineForm = {
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
  bullets: string[];
  ctaLabel: string;
  ctaLink: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

const emptyForm: MachineForm = {
  title: '',
  slug: '',
  shortDescription: '',
  image: '',
  bullets: [],
  ctaLabel: 'Request Details',
  ctaLink: '#contact',
  featured: true,
  active: true,
  sortOrder: 1,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminFeaturedMachinesPage() {
  const { data, mutate } = useSWR('/api/featured-machines', fetcher);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [form, setForm] = useState<MachineForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const machines = useMemo(() => (Array.isArray(data) ? data : []).slice().sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), [data]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: fd,
    });
    setUploading(false);
    if (!res.ok) {
      setFeedback({ type: 'error', message: 'Upload failed' });
      return;
    }
    const { url } = await res.json();
    setForm((current) => ({ ...current, image: url }));
    setFeedback({ type: 'success', message: 'Image uploaded successfully' });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      const url = editingId ? `/api/featured-machines/${editingId}` : '/api/featured-machines';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save machine');
      }
      setForm(emptyForm);
      setEditingId(null);
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: editingId ? 'Machine updated successfully' : 'Machine added successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save machine' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Are you sure you want to delete this machine?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/featured-machines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to delete machine');
      }
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: 'Machine deleted successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete machine' });
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(item: any) {
    setEditingId(item._id);
    setForm({
      title: item.title || '',
      slug: item.slug || '',
      shortDescription: item.shortDescription || '',
      image: item.image || '',
      bullets: item.bullets || [],
      ctaLabel: item.ctaLabel || 'Request Details',
      ctaLink: item.ctaLink || '#contact',
      featured: item.featured !== false,
      active: item.active !== false,
      sortOrder: item.sortOrder || 0,
    });
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Featured Machines</h1>
          <p className="text-sm text-slate-400">Manage machine cards shown on the homepage, including imagery, bullets, CTA, sort order, and featured status.</p>
        </div>
        {feedback ? <AdminFeedback type={feedback.type} message={feedback.message} /> : null}

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Machine title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <div className="flex items-center gap-3 md:col-span-2">
              <input type="file" onChange={handleUpload} className="text-xs text-slate-200" />
              {uploading && <span className="text-xs text-emerald-300">Uploading…</span>}
            </div>
            <textarea
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2"
              rows={4}
              placeholder="Bullets (one per line)"
              value={form.bullets.join('\n')}
              onChange={(e) => setForm({ ...form, bullets: e.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })}
            />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="CTA label" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="CTA link / target" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            <div className="flex items-center gap-4 text-sm text-slate-200">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? (editingId ? 'Saving…' : 'Adding…') : editingId ? 'Update machine' : 'Add machine'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
                Cancel
              </button>
            )}
          </div>
        </div>

        {!machines.length ? (
          <AdminEmptyState title="No featured machines yet" description="Add a machine above to create the homepage featured machine section." />
        ) : (
          <div className="grid gap-4">
            {machines.map((item: any) => (
              <div key={item._id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-slate-200">Sort {item.sortOrder || 0}</span>
                      <span className={`rounded-full px-2 py-1 ${item.featured !== false ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{item.featured !== false ? 'Featured' : 'Not featured'}</span>
                      <span className={`rounded-full px-2 py-1 ${item.active !== false ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{item.active !== false ? 'Active' : 'Hidden'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => startEdit(item)} className="text-emerald-300 hover:underline">Edit</button>
                    <button onClick={() => remove(item._id)} disabled={deletingId === item._id} className="text-red-300 hover:underline disabled:opacity-60">
                      {deletingId === item._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="mt-3 break-all text-xs text-slate-500">{item.image || 'No image uploaded yet.'}</p>
                {item.bullets?.length ? (
                  <ul className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    {item.bullets.map((bullet: string) => (
                      <li key={bullet} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
