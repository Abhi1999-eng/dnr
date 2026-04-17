'use client';

import useSWR from 'swr';
import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';
import { AdminFeedback } from '@/components/AdminFeedback';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ServiceForm = {
  title: string;
  description: string;
  image: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

const emptyForm: ServiceForm = {
  title: '',
  description: '',
  image: '',
  slug: '',
  sortOrder: 1,
  active: true,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminServicesPage() {
  const { data, mutate } = useSWR('/api/services', fetcher);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const services = useMemo(() => (Array.isArray(data) ? data : []).slice().sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), [data]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
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
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save service');
      }
      setForm(emptyForm);
      setEditingId(null);
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: editingId ? 'Service updated successfully' : 'Service added successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save service' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to delete service');
      }
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: 'Service deleted successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete service' });
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(service: any) {
    setEditingId(service._id);
    setForm({
      title: service.title || '',
      description: service.description || '',
      image: service.image || '',
      slug: service.slug || '',
      sortOrder: service.sortOrder || 0,
      active: service.active !== false,
    });
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Services</h1>
          <p className="text-sm text-slate-400">Manage the services section cards that appear on the homepage and services page.</p>
        </div>
        {feedback ? <AdminFeedback type={feedback.type} message={feedback.message} /> : null}

        <div className="glass p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <div className="flex items-center gap-3 md:col-span-2">
              <input type="file" onChange={handleFile} className="text-xs text-slate-200" />
              {uploading && <span className="text-xs text-emerald-300">Uploading…</span>}
            </div>
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 w-40" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? (editingId ? 'Saving…' : 'Adding…') : editingId ? 'Update service' : 'Add service'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
                Cancel
              </button>
            )}
          </div>
        </div>

        {!services.length ? (
          <AdminEmptyState title="No services yet" description="No service cards have been created. Add your first service from the form above." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service: any) => (
              <div key={service._id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{service.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{service.description}</p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => startEdit(service)} className="text-emerald-300 hover:underline">Edit</button>
                    <button onClick={() => remove(service._id)} disabled={deletingId === service._id} className="text-red-300 hover:underline disabled:opacity-60">
                      {deletingId === service._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-2 py-1 text-slate-200">Sort {service.sortOrder || 0}</span>
                  <span className={`rounded-full px-2 py-1 ${service.active !== false ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{service.active !== false ? 'Active' : 'Hidden'}</span>
                </div>
                <p className="mt-3 break-all text-xs text-slate-500">{service.image || 'No image set yet.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
