'use client';
import useSWR from 'swr';
import { useState, ChangeEvent } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminCategoriesPage() {
  const { data, mutate } = useSWR('/api/categories', fetcher);
  const categories = Array.isArray(data) ? data : [];
  const [form, setForm] = useState({ name: '', slug: '', description: '', coverImage: '', sortOrder: 0, featured: false });
  const [uploading, setUploading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

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
    if (!res.ok) return;
    const { url } = await res.json();
    setForm((f) => ({ ...f, coverImage: url }));
  }

  async function saveCategory() {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', slug: '', description: '', coverImage: '', sortOrder: 0, featured: false });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Product Categories</h1>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex items-center gap-2">
              <input type="file" onChange={handleFile} className="text-xs text-slate-200" />
              {uploading && <span className="text-xs text-accent">Uploading…</span>}
            </div>
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Sort order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>
          {form.coverImage && <p className="text-xs text-accent break-all">Image: {form.coverImage}</p>}
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
          </label>
          <button onClick={saveCategory} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
            Add category
          </button>
        </div>
        {!categories.length ? (
          <AdminEmptyState title="No categories yet" description="Create your first category to organize products on the website." />
        ) : (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c: any) => (
                  <tr key={c._id} className="border-t border-white/10">
                    <td className="p-3 text-white">{c.name}</td>
                    <td className="p-3 text-slate-300">{c.slug || '—'}</td>
                    <td className="p-3 text-slate-300"><div className="max-w-sm break-words">{c.description || '—'}</div></td>
                    <td className="p-3 text-xs text-slate-400 break-all">{c.coverImage || 'No image yet'}</td>
                    <td className="p-3 text-slate-300">{c.sortOrder ?? 0}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => remove(c._id)} className="text-red-400 text-sm hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
