'use client';

import Image from 'next/image';
import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';
import { AdminFeedback } from '@/components/AdminFeedback';
import { AdminEditModal } from '@/components/AdminEditModal';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => r.json());

type LogoForm = {
  name: string;
  logoImage: string;
  externalUrl: string;
  sortOrder: number;
  active: boolean;
};

const emptyForm: LogoForm = {
  name: '',
  logoImage: '',
  externalUrl: '',
  sortOrder: 1,
  active: true,
};

export default function AdminClientLogosPage() {
  const { data, mutate } = useSWR('/api/client-logos', fetcher);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [form, setForm] = useState<LogoForm>(emptyForm);
  const [editForm, setEditForm] = useState<LogoForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const logos = useMemo(() => (Array.isArray(data) ? data : []).slice().sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)), [data]);

  function resetEditForm() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>, mode: 'create' | 'edit') {
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
      setEditForm((current) => ({ ...current, logoImage: url }));
    } else {
      setForm((current) => ({ ...current, logoImage: url }));
    }
    e.target.value = ''; 
    setFeedback({ type: 'success', message: 'Logo uploaded successfully' });
  }

  async function save(mode: 'create' | 'edit') {
    setSaving(true);
    try {
      const currentForm = mode === 'edit' ? editForm : form;
      const url = mode === 'edit' && editingId ? `/api/client-logos/${editingId}` : '/api/client-logos';
      const method = mode === 'edit' && editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(currentForm),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save logo');
      }
      if (mode === 'edit') {
        resetEditForm();
      } else {
        setForm(emptyForm);
      }
      await mutate(undefined, { revalidate: true });
      router.refresh();
      setFeedback({ type: 'success', message: mode === 'edit' ? 'Logo updated successfully' : 'Logo added successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save logo' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Are you sure you want to delete this logo?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/client-logos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to delete logo');
      }
      if (editingId === id) {
        resetEditForm();
      }
      await mutate(undefined, { revalidate: true });
      router.refresh();
      setFeedback({ type: 'success', message: 'Logo deleted successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete logo' });
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(item: any) {
    setEditingId(item._id);
    setEditForm({
      name: item.name || '',
      logoImage: item.logoImage || '',
      externalUrl: item.externalUrl || '',
      sortOrder: item.sortOrder || 0,
      active: item.active !== false,
    });
  }

  function renderLogoForm(mode: 'create' | 'edit') {
    const currentForm = mode === 'edit' ? editForm : form;
    const setCurrentForm = mode === 'edit' ? setEditForm : setForm;

    return (
      <>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2 text-xs text-slate-400">{mode === 'edit' ? 'Editing selected logo' : 'Add a new brand logo'}</div>
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Brand name" value={currentForm.name} onChange={(e) => setCurrentForm({ ...currentForm, name: e.target.value })} />
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="External URL (optional)" value={currentForm.externalUrl} onChange={(e) => setCurrentForm({ ...currentForm, externalUrl: e.target.value })} />
          <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Logo image URL" value={currentForm.logoImage} onChange={(e) => setCurrentForm({ ...currentForm, logoImage: e.target.value })} />
          {currentForm.logoImage ? (
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Preview</p>
              <Image src={currentForm.logoImage} alt={currentForm.name || 'Logo preview'} width={160} height={64} className="h-16 w-auto object-contain" unoptimized={currentForm.logoImage.startsWith('/uploads/')} />
            </div>
          ) : null}
          <div className="flex items-center gap-3 md:col-span-2">
            <input type="file" onChange={(e) => handleUpload(e, mode)} className="text-xs text-slate-200" />
            {uploading && <span className="text-xs text-emerald-300">Uploading…</span>}
            <input className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2" type="number" placeholder="Sort order" value={currentForm.sortOrder} onChange={(e) => setCurrentForm({ ...currentForm, sortOrder: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={currentForm.active} onChange={(e) => setCurrentForm({ ...currentForm, active: e.target.checked })} /> Active
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => save(mode)} disabled={saving} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add logo'}
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
          <h1 className="text-2xl font-semibold text-white">Client Logos / Associated Brands</h1>
          <p className="text-sm text-slate-400">Add, edit, reorder, and hide/show client or brand cards used on the homepage.</p>
        </div>
        {feedback ? <AdminFeedback type={feedback.type} message={feedback.message} /> : null}

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Add logo</h2>
            <p className="text-sm text-slate-400">Create a new associated brand here. Editing an existing logo opens in a modal.</p>
          </div>
          {renderLogoForm('create')}
        </div>

        {!logos.length ? (
          <AdminEmptyState title="No client logos yet" description="Upload your first logo to create the associated brands section on the homepage." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {logos.map((item: any) => (
              <div key={item._id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Sort {item.sortOrder || 0}</p>
                    <p className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.active !== false ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                      {item.active !== false ? 'Active' : 'Hidden'}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => startEdit(item)} className="text-emerald-300 hover:underline">Edit</button>
                    <button onClick={() => remove(item._id)} disabled={deletingId === item._id} className="text-red-300 hover:underline disabled:opacity-60">
                      {deletingId === item._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="mt-3 break-all text-xs text-slate-400">{item.logoImage || 'No logo image uploaded yet.'}</p>
                {item.externalUrl && <p className="mt-1 break-all text-xs text-slate-500">{item.externalUrl}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <AdminEditModal open={Boolean(editingId)} onClose={resetEditForm} title="Edit client logo" description="Update the selected client or brand logo without leaving the list.">
        <div className="space-y-4">{renderLogoForm('edit')}</div>
      </AdminEditModal>
    </AdminShell>
  );
}
