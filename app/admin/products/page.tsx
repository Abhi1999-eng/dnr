'use client';

import useSWR from 'swr';
import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';
import { AdminFeedback } from '@/components/AdminFeedback';
import { AdminEditModal } from '@/components/AdminEditModal';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FormState = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
};

type BulkUploadResult = {
  filename: string;
  title: string;
  slug: string;
  status: 'created' | 'skipped' | 'failed';
  reason: string;
};

type BulkUploadSummary = {
  created: number;
  skipped: number;
  failed: number;
  total: number;
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
  const router = useRouter();
  const products = Array.isArray(data) ? data : [];
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkSummary, setBulkSummary] = useState<BulkUploadSummary | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkUploadResult[]>([]);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  function resetForm() {
    setForm(emptyForm);
  }

  function resetEditForm() {
    setEditForm(emptyForm);
    setEditingId(null);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>, target: 'hero' | 'gallery', mode: 'create' | 'edit') {
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
        if (mode === 'edit') {
          setEditForm((current) => ({ ...current, image: url }));
        } else {
          setForm((current) => ({ ...current, image: url }));
        }
      } else {
        if (mode === 'edit') {
          setEditForm((current) => ({ ...current, gallery: [...current.gallery, url] }));
        } else {
          setForm((current) => ({ ...current, gallery: [...current.gallery, url] }));
        }
      }
      setFeedback({ type: 'success', message: 'Image uploaded successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function saveProduct(mode: 'create' | 'edit') {
    setSaving(true);

    try {
      const currentForm = mode === 'edit' ? editForm : form;
      const payload = {
        ...currentForm,
        slug: currentForm.slug || slugify(currentForm.title),
        heroImage: currentForm.image,
      };

      const url = mode === 'edit' && editingId ? `/api/products/${editingId}` : '/api/products';
      const method = mode === 'edit' && editingId ? 'PUT' : 'POST';
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

      if (mode === 'edit') {
        resetEditForm();
      } else {
        resetForm();
      }
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: mode === 'edit' ? 'Product updated successfully' : 'Product added successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save product' });
    } finally {
      setSaving(false);
    }
  }

  async function bulkUploadProducts() {
    if (!bulkFiles.length) return;
    setBulkUploading(true);
    setBulkSummary(null);
    setBulkResults([]);

    try {
      const formData = new FormData();
      bulkFiles.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/admin/products/bulk-image-upload', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData,
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.message || 'Bulk upload failed');
      }

      setBulkSummary(payload.summary || null);
      setBulkResults(Array.isArray(payload.results) ? payload.results : []);
      setBulkFiles([]);
      await mutate();
      router.refresh();

      const createdCount = payload?.summary?.created ?? 0;
      const skippedCount = payload?.summary?.skipped ?? 0;
      const failedCount = payload?.summary?.failed ?? 0;
      setFeedback({
        type: createdCount > 0 ? 'success' : failedCount > 0 ? 'error' : 'success',
        message: `Bulk upload finished: ${createdCount} created, ${skippedCount} skipped, ${failedCount} failed.`,
      });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Bulk upload failed' });
    } finally {
      setBulkUploading(false);
    }
  }

  function startEdit(product: any) {
    setEditingId(product._id);
    setEditForm({
      title: product.title || '',
      slug: product.slug || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      image: product.heroImage || product.image || '',
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
    });
  }

  async function removeProduct(id: string) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to delete product');
      }

      if (editingId === id) resetEditForm();
      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: 'Product deleted successfully' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete product' });
    } finally {
      setDeletingId(null);
    }
  }

  function renderProductForm(mode: 'create' | 'edit') {
    const currentForm = mode === 'edit' ? editForm : form;
    const setCurrentForm = mode === 'edit' ? setEditForm : setForm;

    return (
      <>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Product title</span>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              value={currentForm.title}
              onChange={(e) => setCurrentForm((current) => ({ ...current, title: e.target.value, slug: current.slug || slugify(e.target.value) }))}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span>Slug</span>
            <input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={currentForm.slug} onChange={(e) => setCurrentForm((current) => ({ ...current, slug: e.target.value }))} />
          </label>
          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span>Short description</span>
            <textarea
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              rows={2}
              value={currentForm.shortDescription}
              onChange={(e) => setCurrentForm((current) => ({ ...current, shortDescription: e.target.value }))}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span>Long description</span>
            <textarea
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              rows={5}
              value={currentForm.description}
              onChange={(e) => setCurrentForm((current) => ({ ...current, description: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Main image</p>
            <input type="file" onChange={(e) => handleFile(e, 'hero', mode)} className="text-xs text-slate-200" />
            {uploading ? <span className="text-xs text-accent">Uploading…</span> : null}
            {currentForm.image ? <p className="break-all text-xs text-accent">{currentForm.image}</p> : <p className="text-xs text-slate-400">Upload or replace the main product image.</p>}
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Gallery images</p>
            <input type="file" onChange={(e) => handleFile(e, 'gallery', mode)} className="text-xs text-slate-200" />
            {currentForm.gallery.length ? (
              <div className="space-y-2">
                {currentForm.gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="flex items-center justify-between gap-3 text-xs text-slate-300">
                    <span className="truncate">{image}</span>
                    <button
                      type="button"
                      className="rounded-full border border-red-400/20 px-2 py-1 text-red-200"
                      onClick={() =>
                        setCurrentForm((current) => ({
                          ...current,
                          gallery: current.gallery.filter((_, galleryIndex) => galleryIndex !== index),
                        }))
                      }
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
            onClick={() => saveProduct(mode)}
            disabled={saving || !currentForm.title.trim()}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add product'}
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
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="text-sm text-slate-400">Add, edit, or delete products. Every saved product appears automatically on the homepage and products page.</p>
        </div>
        {feedback ? <AdminFeedback type={feedback.type} message={feedback.message} /> : null}

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Bulk Upload Products From Images</h2>
            <p className="text-sm text-slate-400">
              Select multiple product images. Each filename becomes a product title, each uploaded image becomes the main product image, and duplicates are skipped automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Choose product images</span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => setBulkFiles(Array.from(event.target.files || []))}
                className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-900"
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                {bulkFiles.length} file{bulkFiles.length === 1 ? '' : 's'} selected
              </span>
              <button
                type="button"
                onClick={bulkUploadProducts}
                disabled={bulkUploading || !bulkFiles.length}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkUploading ? 'Uploading…' : 'Bulk Upload Products'}
              </button>
            </div>
            {bulkFiles.length ? (
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {bulkFiles.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="rounded-xl border border-white/10 bg-slate-950/20 px-3 py-2 text-xs text-slate-300">
                    {file.name}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {bulkSummary ? (
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Created</p>
                <p className="mt-1 text-2xl font-semibold">{bulkSummary.created}</p>
              </div>
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Skipped</p>
                <p className="mt-1 text-2xl font-semibold">{bulkSummary.skipped}</p>
              </div>
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                <p className="text-xs uppercase tracking-[0.18em] text-red-200/80">Failed</p>
                <p className="mt-1 text-2xl font-semibold">{bulkSummary.failed}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Total files</p>
                <p className="mt-1 text-2xl font-semibold">{bulkSummary.total}</p>
              </div>
            </div>
          ) : null}

          {bulkResults.length ? (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400">
                  <tr>
                    <th className="p-3">Filename</th>
                    <th className="p-3">Generated title</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((item) => (
                    <tr key={`${item.filename}-${item.slug}`} className="border-t border-white/10">
                      <td className="p-3 text-slate-200">{item.filename}</td>
                      <td className="p-3 text-white">{item.title}</td>
                      <td className="p-3 text-slate-300">{item.slug}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                            item.status === 'created'
                              ? 'bg-emerald-400/15 text-emerald-200'
                              : item.status === 'skipped'
                                ? 'bg-amber-400/15 text-amber-200'
                                : 'bg-red-400/15 text-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Add product</h2>
            <p className="text-sm text-slate-400">Create a new product here. Editing existing products now opens in a modal so you can stay on the list view.</p>
          </div>
          {renderProductForm('create')}
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
                          disabled={deletingId === product._id}
                          className="text-sm font-semibold text-red-300 hover:text-red-200"
                        >
                          {deletingId === product._id ? 'Deleting…' : 'Delete'}
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
      <AdminEditModal open={isEditing} onClose={resetEditForm} title="Edit product" description="Update the selected product without leaving the products list.">
        <div className="space-y-4">{renderProductForm('edit')}</div>
      </AdminEditModal>
    </AdminShell>
  );
}
