'use client';

import Link from 'next/link';
import useSWR from 'swr';
import type { ChangeEvent } from 'react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AdminEditModal } from '@/components/AdminEditModal';
import { AdminEmptyState } from '@/components/AdminEmptyState';
import { AdminFeedback } from '@/components/AdminFeedback';
import { AdminShell } from '@/components/AdminShell';
import { slugifyBlog } from '@/lib/blog';
import { resolveMediaUrl } from '@/lib/media';
import { useAdminToken } from '@/components/useAdminToken';

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  authorName: string;
  authorImage: string;
  category: string;
  tags: string;
  relatedProducts: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  status: 'draft' | 'published';
  publishedAt: string;
};

type ProductOption = {
  _id: string;
  title: string;
  slug: string;
};

const emptyForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  featuredImageAlt: '',
  authorName: 'DNR Techno Services',
  authorImage: '',
  category: '',
  tags: '',
  relatedProducts: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  status: 'draft',
  publishedAt: '',
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to fetch data');
  }
  return response.json();
};

const adminFetcher = async ([url, token]: [string, string]) => {
  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Unable to fetch blogs');
  }

  return response.json();
};

function formatDate(value?: string) {
  if (!value) return 'Not published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not published';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const token = useAdminToken();
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(token ? ['/api/blogs?scope=admin', token] : null, adminFetcher);
  const { data: productsData, error: productsError } = useSWR('/api/products', fetcher);
  const blogs = useMemo(() => (Array.isArray(data?.blogs) ? data.blogs : Array.isArray(data) ? data : []), [data]);
  const products = useMemo(() => {
    const source = Array.isArray(productsData?.products) ? productsData.products : Array.isArray(productsData) ? productsData : [];
    return source as ProductOption[];
  }, [productsData]);

  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [editForm, setEditForm] = useState<BlogFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [editSlugTouched, setEditSlugTouched] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function resetCreateForm() {
    setForm(emptyForm);
    setSlugTouched(false);
  }

  function resetEditForm() {
    setEditForm(emptyForm);
    setEditingId(null);
    setEditSlugTouched(false);
  }

  function setCreateField<K extends keyof BlogFormState>(field: K, value: BlogFormState[K]) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'title' && !slugTouched) {
        next.slug = slugifyBlog(String(value));
      }
      return next;
    });
  }

  function setEditField<K extends keyof BlogFormState>(field: K, value: BlogFormState[K]) {
    setEditForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'title' && !editSlugTouched) {
        next.slug = slugifyBlog(String(value));
      }
      return next;
    });
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, field: 'featuredImage' | 'authorImage', mode: 'create' | 'edit') {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingField(`${mode}-${field}`);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Upload failed');
      }

      const payload = await response.json();
      if (mode === 'edit') {
        setEditField(field, payload.url || '');
      } else {
        setCreateField(field, payload.url || '');
      }
      setFeedback({ type: 'success', message: 'Image uploaded successfully.' });
    } catch (uploadError) {
      setFeedback({ type: 'error', message: uploadError instanceof Error ? uploadError.message : 'Upload failed' });
    } finally {
      setUploadingField(null);
      event.target.value = '';
    }
  }

  function toggleRelatedProduct(id: string, mode: 'create' | 'edit') {
    const setter = mode === 'edit' ? setEditField : setCreateField;
    const currentForm = mode === 'edit' ? editForm : form;
    const next = currentForm.relatedProducts.includes(id)
      ? currentForm.relatedProducts.filter((item) => item !== id)
      : [...currentForm.relatedProducts, id];
    setter('relatedProducts', next);
  }

  async function saveBlog(mode: 'create' | 'edit') {
    setSaving(true);

    try {
      const currentForm = mode === 'edit' ? editForm : form;
      const url = mode === 'edit' && editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = mode === 'edit' && editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          ...currentForm,
          featuredImage: currentForm.featuredImage.trim(),
          authorImage: currentForm.authorImage.trim(),
          slug: currentForm.slug || slugifyBlog(currentForm.title),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Unable to save blog');
      }

      if (mode === 'edit') {
        resetEditForm();
      } else {
        resetCreateForm();
      }

      await mutate();
      router.refresh();
      setFeedback({
        type: 'success',
        message: mode === 'edit' ? 'Blog updated successfully.' : 'Blog created successfully.',
      });
    } catch (saveError) {
      setFeedback({ type: 'error', message: saveError instanceof Error ? saveError.message : 'Unable to save blog' });
    } finally {
      setSaving(false);
    }
  }

  async function removeBlog(id: string) {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    setDeletingId(id);

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Unable to delete blog');
      }

      if (editingId === id) {
        resetEditForm();
      }

      await mutate();
      router.refresh();
      setFeedback({ type: 'success', message: 'Blog deleted successfully.' });
    } catch (deleteError) {
      setFeedback({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Unable to delete blog' });
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(blog: any) {
    setEditingId(blog._id);
    setEditSlugTouched(false);
    setEditForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      featuredImageAlt: blog.featuredImageAlt || '',
      authorName: blog.authorName || 'DNR Techno Services',
      authorImage: blog.authorImage || '',
      category: blog.category || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      relatedProducts: Array.isArray(blog.relatedProducts)
        ? blog.relatedProducts.map((item: any) => (typeof item === 'string' ? item : item?._id || '')).filter(Boolean)
        : [],
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      seoKeywords: Array.isArray(blog.seoKeywords) ? blog.seoKeywords.join(', ') : '',
      canonicalUrl: blog.canonicalUrl || '',
      status: blog.status === 'published' ? 'published' : 'draft',
      publishedAt: blog.publishedAt ? String(blog.publishedAt).slice(0, 10) : '',
    });
  }



  function renderForm(mode: 'create' | 'edit') {
    const currentForm = mode === 'edit' ? editForm : form;
    const setField = mode === 'edit' ? setEditField : setCreateField;

    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Title</label>
            <input value={currentForm.title} onChange={(event) => setField('title', event.target.value)} placeholder="Blog title" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Slug</label>
            <input
              value={currentForm.slug}
              onChange={(event) => {
                if (mode === 'edit') setEditSlugTouched(true);
                else setSlugTouched(true);
                setField('slug', slugifyBlog(event.target.value));
              }}
              placeholder="blog-slug"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Excerpt</label>
            <textarea rows={3} value={currentForm.excerpt} onChange={(event) => setField('excerpt', event.target.value)} placeholder="Short summary for cards and SEO fallback" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Content</label>
            <textarea rows={14} value={currentForm.content} onChange={(event) => setField('content', event.target.value)} placeholder="Use simple markdown like headings, bullet lists, and links." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Featured image URL</label>
            <input value={currentForm.featuredImage} onChange={(event) => setField('featuredImage', event.target.value)} placeholder="/uploads/blog-image.png" />
            {currentForm.featuredImage ? <p className="break-all text-xs text-slate-500">{resolveMediaUrl(currentForm.featuredImage, '')}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Featured image alt</label>
            <input value={currentForm.featuredImageAlt} onChange={(event) => setField('featuredImageAlt', event.target.value)} placeholder="Describe the featured image" />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <input type="file" accept="image/*" onChange={(event) => handleUpload(event, 'featuredImage', mode)} className="text-xs text-slate-200" />
            {uploadingField === `${mode}-featuredImage` ? <span className="text-xs text-emerald-300">Uploading featured image...</span> : null}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Author name</label>
            <input value={currentForm.authorName} onChange={(event) => setField('authorName', event.target.value)} placeholder="DNR Techno Services" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Author image URL</label>
            <input value={currentForm.authorImage} onChange={(event) => setField('authorImage', event.target.value)} placeholder="Optional author photo" />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <input type="file" accept="image/*" onChange={(event) => handleUpload(event, 'authorImage', mode)} className="text-xs text-slate-200" />
            {uploadingField === `${mode}-authorImage` ? <span className="text-xs text-emerald-300">Uploading author image...</span> : null}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category</label>
            <input value={currentForm.category} onChange={(event) => setField('category', event.target.value)} placeholder="Industrial maintenance" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tags</label>
            <input value={currentForm.tags} onChange={(event) => setField('tags', event.target.value)} placeholder="machinery, uptime, maintenance" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</label>
            <select value={currentForm.status} onChange={(event) => setField('status', event.target.value as 'draft' | 'published')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Published date</label>
            <input type="date" value={currentForm.publishedAt} onChange={(event) => setField('publishedAt', event.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">SEO title</label>
            <input value={currentForm.seoTitle} onChange={(event) => setField('seoTitle', event.target.value)} placeholder="Custom SEO title" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">SEO description</label>
            <textarea rows={3} value={currentForm.seoDescription} onChange={(event) => setField('seoDescription', event.target.value)} placeholder="Custom SEO description" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">SEO keywords</label>
            <input value={currentForm.seoKeywords} onChange={(event) => setField('seoKeywords', event.target.value)} placeholder="industrial machinery, guides" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Canonical URL</label>
            <input value={currentForm.canonicalUrl} onChange={(event) => setField('canonicalUrl', event.target.value)} placeholder="https://dnrtechnoservices.com/blog/..." />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Related products</h3>
            <p className="text-sm text-slate-400">Select products to feature alongside this blog article.</p>
          </div>
          {products.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const active = currentForm.relatedProducts.includes(product._id);
                return (
                  <button
                    type="button"
                    key={product._id}
                    onClick={() => toggleRelatedProduct(product._id, mode)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-[#7ed321]/60 bg-[#7ed321]/10 text-white'
                        : 'border-white/10 bg-[#071014] text-slate-300 hover:border-[#7ed321]/25 hover:bg-white/[0.03]'
                    }`}
                  >
                    <p className="font-medium">{product.title}</p>
                    <p className="mt-1 text-xs text-slate-400">/{product.slug}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No products available yet.</p>
          )}
          {productsError ? <p className="text-sm text-amber-300">Related products are temporarily unavailable, but the page still works.</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => saveBlog(mode)}
            disabled={saving || Boolean(uploadingField)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create blog'}
          </button>
          {mode === 'edit' ? (
            <button type="button" onClick={resetEditForm} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Blogs</h1>
            <p className="text-sm text-slate-400">Create industrial insights, machine guides, and SEO-friendly blog content for the public website.</p>
          </div>
          <Link href="/admin/blogs/new" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            Create Blog
          </Link>
        </div>

        {feedback ? <AdminFeedback type={feedback.type} message={feedback.message} /> : null}
        {error ? <AdminFeedback type="error" message={error.message || 'This page could not load blogs right now.'} /> : null}

        {!token ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">Loading blog manager...</div>
        ) : null}

        <div id="create-blog" className="glass space-y-4 rounded-2xl border border-white/10 p-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Create blog</h2>
            <p className="text-sm text-slate-400">Draft now, publish when ready, and connect articles to products for better lead generation.</p>
          </div>
          {renderForm('create')}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog: any) => (
                  <tr key={blog._id} className="border-b border-white/6 last:border-0">
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{blog.title || 'Untitled blog'}</p>
                        <p className="line-clamp-2 max-w-[420px] text-xs leading-5 text-slate-400">{blog.excerpt || blog.content || 'No summary added yet.'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-300">/{blog.slug || 'draft-slug'}</td>
                    <td className="px-4 py-4 align-top">
                      <span className={`rounded-full px-2 py-1 text-xs ${blog.status === 'published' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-slate-300'}`}>
                        {blog.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-300">{formatDate(blog.publishedAt)}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => startEdit(blog)} className="text-emerald-300 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => removeBlog(blog._id)} disabled={deletingId === blog._id} className="text-red-300 hover:underline disabled:opacity-60">
                          {deletingId === blog._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {token && !isLoading && !blogs.length ? <div className="p-4"><AdminEmptyState title="No blogs yet" description="Add your first blog post from the form above." /></div> : null}
        </div>
      </div>

      <AdminEditModal open={Boolean(editingId)} onClose={resetEditForm} title="Edit blog" description="Update content, SEO fields, and product associations.">
        {renderForm('edit')}
      </AdminEditModal>
    </AdminShell>
  );
}
