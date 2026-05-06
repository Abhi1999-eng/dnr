'use client';

import useSWR from 'swr';
import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';
import { AdminFeedback } from '@/components/AdminFeedback';
import { AdminEditModal } from '@/components/AdminEditModal';
import { resolveMediaUrl } from '@/lib/media';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ServiceForm = {
  title: string;
  description: string;
  longDescription: string;
  image: string;
  slug: string;
  sortOrder: number;
  active: boolean;
};

const emptyForm: ServiceForm = {
  title: '',
  description: '',
  longDescription: '',
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
  const [editForm, setEditForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const services = useMemo(() => (Array.isArray(data) ? data : []).slice().sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), [data]);

  function resetEditForm() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>, mode: 'create' | 'edit') {
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
    if (mode === 'edit') {
      setEditForm((current) => ({ ...current, image: url }));
    } else {
      setForm((current) => ({ ...current, image: url }));
    }
    setFeedback({ type: 'success', message: 'Image uploaded successfully' });
  }

  async function save(mode: 'create' | 'edit') {
    setSaving(true);
    try {
      const currentForm = mode === 'edit' ? editForm : form;
      const normalizedImage = currentForm.image.trim() ? resolveMediaUrl(currentForm.image, '') : currentForm.image;
      const url = mode === 'edit' && editingId ? `/api/services/${editingId}` : '/api/services';
      const method = mode === 'edit' && editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ ...currentForm, image: normalizedImage || '', slug: currentForm.slug || slugify(currentForm.title) }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save service');
      }
      if (mode === 'edit') {
        resetEditForm();
      } else {
        setForm(emptyForm);
      }
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: mode === 'edit' ? 'Service updated successfully' : 'Service added successfully' });
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
        resetEditForm();
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
    setEditForm({
      title: service.title || '',
      description: service.description || '',
      longDescription: service.longDescription || '',
      image: service.image || '',
      slug: service.slug || '',
      sortOrder: service.sortOrder || 0,
      active: service.active !== false,
    });
  }

  function renderServiceForm(mode: 'create' | 'edit') {
    const currentForm = mode === 'edit' ? editForm : form;
    const setCurrentForm = mode === 'edit' ? setEditForm : setForm;

    return (
      <>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Title" value={currentForm.title} onChange={(e) => setCurrentForm({ ...currentForm, title: e.target.value, slug: slugify(e.target.value) })} />
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Slug" value={currentForm.slug} onChange={(e) => setCurrentForm({ ...currentForm, slug: e.target.value })} />
          <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Short description" value={currentForm.description} onChange={(e) => setCurrentForm({ ...currentForm, description: e.target.value })} />
          <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={5} placeholder="Long description for the detail page" value={currentForm.longDescription} onChange={(e) => setCurrentForm({ ...currentForm, longDescription: e.target.value })} />
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Image URL" value={currentForm.image} onChange={(e) => setCurrentForm({ ...currentForm, image: e.target.value })} />
          <div className="flex items-center gap-3 md:col-span-2">
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, mode)} className="text-xs text-slate-200" />
            {uploading && <span className="text-xs text-emerald-300">Uploading…</span>}
          </div>
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 w-40" type="number" placeholder="Sort order" value={currentForm.sortOrder} onChange={(e) => setCurrentForm({ ...currentForm, sortOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={currentForm.active} onChange={(e) => setCurrentForm({ ...currentForm, active: e.target.checked })} /> Active
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={() => save(mode)} disabled={saving || uploading} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add service'}
          </button>
          {mode === 'edit' ? (
            <button onClick={resetEditForm} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
              Cancel
            </button>
          ) : null}
        </div>
      </>
    );
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
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Add service</h2>
            <p className="text-sm text-slate-400">Create new services here. Editing an existing service opens in a modal.</p>
          </div>
          {renderServiceForm('create')}
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
                    {service.longDescription ? <p className="mt-2 line-clamp-2 text-xs text-slate-500">{service.longDescription}</p> : null}
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
      <AdminEditModal open={Boolean(editingId)} onClose={resetEditForm} title="Edit service" description="Update this service without leaving the services list.">
        <div className="space-y-4">{renderServiceForm('edit')}</div>
      </AdminEditModal>
    </AdminShell>
  );
}
