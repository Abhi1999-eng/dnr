import { Types } from 'mongoose';
import { Blog } from '@/models/Blog';

export type BlogStatus = 'draft' | 'published';

export function slugifyBlog(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function splitCommaSeparated(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeBlogStatus(value: unknown): BlogStatus {
  return value === 'published' ? 'published' : 'draft';
}

export function normalizeRelatedProductIds(value: unknown) {
  const ids = Array.isArray(value) ? value : [];
  return ids
    .map((item) => String(item || '').trim())
    .filter((item, index, collection) => item && collection.indexOf(item) === index && Types.ObjectId.isValid(item))
    .map((item) => new Types.ObjectId(item));
}

export async function ensureUniqueBlogSlug(input: {
  title?: string;
  slug?: string;
  excludeId?: string;
}) {
  const baseSlug = slugifyBlog(input.slug || input.title || 'blog');
  let candidate = baseSlug || 'blog';
  let suffix = 2;

  while (true) {
    const existing = await Blog.findOne({
      slug: candidate,
      ...(input.excludeId ? { _id: { $ne: input.excludeId } } : {}),
    })
      .select('_id')
      .lean();

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug || 'blog'}-${suffix}`;
    suffix += 1;
  }
}

export async function normalizeBlogPayload(body: any, excludeId?: string) {
  const title = String(body?.title || '').trim();
  const content = String(body?.content || '').trim();
  const status = normalizeBlogStatus(body?.status);
  const publishedAtInput = body?.publishedAt ? new Date(body.publishedAt) : null;

  return {
    title,
    slug: await ensureUniqueBlogSlug({
      title,
      slug: String(body?.slug || '').trim(),
      excludeId,
    }),
    excerpt: String(body?.excerpt || '').trim(),
    content,
    featuredImage: String(body?.featuredImage || '').trim(),
    featuredImageAlt: String(body?.featuredImageAlt || '').trim(),
    authorName: String(body?.authorName || '').trim(),
    authorImage: String(body?.authorImage || '').trim(),
    category: String(body?.category || '').trim(),
    tags: splitCommaSeparated(body?.tags),
    relatedProducts: normalizeRelatedProductIds(body?.relatedProducts),
    seoTitle: String(body?.seoTitle || '').trim(),
    seoDescription: String(body?.seoDescription || '').trim(),
    seoKeywords: splitCommaSeparated(body?.seoKeywords),
    canonicalUrl: String(body?.canonicalUrl || '').trim(),
    status,
    publishedAt: status === 'published' ? publishedAtInput || new Date() : null,
  };
}

export function validateBlogPayload(payload: Awaited<ReturnType<typeof normalizeBlogPayload>>) {
  if (!payload.title) {
    return 'Title is required.';
  }

  if (!payload.content) {
    return 'Content is required.';
  }

  if (!payload.status) {
    return 'Status is required.';
  }

  return '';
}
