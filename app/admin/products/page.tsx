'use client';
import useSWR from 'swr';
import { useState, ChangeEvent } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FormState = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
};

export default function AdminProductsPage() {
  const { data, mutate } = useSWR('/api/products', fetcher);
  const { data: categories } = useSWR('/api/categories', fetcher);
  const products = Array.isArray(data) ? data : [];
  const categoryOptions = Array.isArray(categories) ? categories : [];
  const [form, setForm] = useState<FormState>({
    title: '',
    slug: '',
    category: '',
    shortDescription: '',
    description: '',
    heroImage: '',
    gallery: [],
    featured: false,
    published: true,
  });
  const [uploading, setUploading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

  async function handleFile(e: ChangeEvent<HTMLInputElement>, target: 'hero' | 'gallery') {
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
    if (target === 'hero') setForm((f) => ({ ...f, heroImage: url }));
    else setForm((f) => ({ ...f, gallery: [...f.gallery, url] }));
  }

  async function saveProduct() {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(form),
    });
    setForm({
      title: '',
      slug: '',
      category: '',
      shortDescription: '',
      description: '',
      heroImage: '',
      gallery: [],
      featured: false,
      published: true,
    });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/products/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Products</h1>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {categoryOptions.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 md:col-span-2"
              placeholder="Short description"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 md:col-span-3"
              placeholder="Long description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex items-center gap-2 md:col-span-3">
              <input type="file" onChange={(e) => handleFile(e, 'hero')} className="text-xs text-slate-200" />
              {uploading && <span className="text-xs text-accent">Uploading…</span>}
              {form.heroImage && <span className="text-xs text-accent break-all">Hero: {form.heroImage}</span>}
            </div>
            <div className="flex items-center gap-2 md:col-span-3">
              <input type="file" onChange={(e) => handleFile(e, 'gallery')} className="text-xs text-slate-200" />
              {form.gallery.length > 0 && <span className="text-xs text-accent">Gallery: {form.gallery.length} image(s)</span>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-200">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published
            </label>
          </div>
          <button onClick={saveProduct} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
            Add product
          </button>
        </div>
        {!products.length ? (
          <AdminEmptyState title="No products yet" description="Add your first product above to start testing the product CMS." />
        ) : (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Hero</th>
                  <th className="p-3">Published</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p._id} className="border-t border-white/10">
                    <td className="p-3 text-white">{p.title}</td>
                    <td className="p-3 text-slate-300">{p.category?.name || '—'}</td>
                    <td className="p-3 text-slate-300"><div className="max-w-sm break-words">{p.shortDescription || '—'}</div></td>
                    <td className="p-3 text-xs text-slate-400 break-all">{p.heroImage || '—'}</td>
                    <td className="p-3 text-slate-300">{p.published ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => remove(p._id)} className="text-red-400 text-sm hover:text-red-300">
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
