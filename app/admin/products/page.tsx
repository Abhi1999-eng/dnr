'use client';

import useSWR from 'swr';
import { ChangeEvent, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FormState = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  image: '',
  gallery: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function AdminProductsPage() {
  const { data, mutate } = useSWR('/api/products', fetcher);
  const products = Array.isArray(data) ? data : [];
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>, target: 'hero' | 'gallery') {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: fd,
      });

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      if (target === 'hero') {
        setForm((current) => ({ ...current, image: url }));
      } else {
        setForm((current) => ({ ...current, gallery: [...current.gallery, url] }));
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function saveProduct() {
    setSaving(true);

    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        heroImage: form.image,
      };

      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save product');
      }

      resetForm();
      await mutate();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product: any) {
    setEditingId(product._id);
    setForm({
      title: product.title || '',
      slug: product.slug || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      image: product.heroImage || product.image || '',
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
    });
  }

  async function removeProduct(id: string) {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Unable to delete product');
    }

    if (editingId === id) resetForm();
    await mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-slate-400">Add, edit, or delete products. Every saved product appears automatically on the homepage and products page.</p>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Product title</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value, slug: current.slug || slugify(e.target.value) }))}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Slug</span>
              <input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} />
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Short description</span>
              <textarea
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm((current) => ({ ...current, shortDescription: e.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Long description</span>
              <textarea
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                rows={5}
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Main image</p>
              <input type="file" onChange={(e) => handleFile(e, 'hero')} className="text-xs text-slate-200" />
              {uploading ? <span className="text-xs text-accent">Uploading…</span> : null}
              {form.image ? <p className="break-all text-xs text-accent">{form.image}</p> : <p className="text-xs text-slate-400">Upload or replace the main product image.</p>}
            </div>

            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Gallery images</p>
              <input type="file" onChange={(e) => handleFile(e, 'gallery')} className="text-xs text-slate-200" />
              {form.gallery.length ? (
                <div className="space-y-2">
                  {form.gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span className="truncate">{image}</span>
                      <button
                        type="button"
                        className="rounded-full border border-red-400/20 px-2 py-1 text-red-200"
                        onClick={() => setForm((current) => ({ ...current, gallery: current.gallery.filter((_, galleryIndex) => galleryIndex !== index) }))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Optional extra images for the product detail page.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveProduct}
              disabled={saving || !form.title.trim()}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEditing ? 'Update product' : 'Add product'}
            </button>
            {isEditing ? (
              <button onClick={resetForm} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>

        {!products.length ? (
          <AdminEmptyState title="No products yet" description="Add your first product above. It will appear automatically on the homepage and products page." />
        ) : (
          <div className="glass overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Short description</th>
                  <th className="p-3">Image</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr key={product._id} className="border-t border-white/10">
                    <td className="p-3 text-white">{product.title}</td>
                    <td className="p-3 text-slate-300">{product.slug}</td>
                    <td className="p-3 text-slate-300">
                      <div className="max-w-sm break-words">{product.shortDescription || '—'}</div>
                    </td>
                    <td className="p-3 text-xs text-slate-400 break-all">{product.heroImage || product.image || '—'}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => startEdit(product)} className="text-sm font-semibold text-primary hover:underline">
                          Edit
                        </button>
                        <button
                          onClick={() => removeProduct(product._id)}
                          className="text-sm font-semibold text-red-300 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
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
