import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { Service } from '@/models/Service';
import { Blog } from '@/models/Blog';
import { HomepageContent } from '@/models/HomepageContent';
import { SiteSettings } from '@/models/SiteSettings';
import { resolveMediaUrl } from '@/lib/media';
import { absoluteUrl, SITE_URL } from '@/lib/seo';

/**
 * Without this the sitemap is generated once at build time, so anything added
 * through the CMS afterwards never appears in it. Matches the revalidate window
 * the listing and detail pages already use.
 */
export const revalidate = 300;

/** Newest `updatedAt` across a set of documents, or undefined when there is none. */
function newestUpdate(...groups: Array<Array<{ updatedAt?: Date | string } | null | undefined>>) {
  const times = groups
    .flat()
    .map((doc) => (doc?.updatedAt ? new Date(doc.updatedAt).getTime() : NaN))
    .filter((time) => Number.isFinite(time));

  return times.length ? new Date(Math.max(...times)) : undefined;
}

function absoluteImage(value?: string | null) {
  if (!value) return undefined;
  const resolved = resolveMediaUrl(value, '');
  if (!resolved) return undefined;
  return resolved.startsWith('http') ? resolved : absoluteUrl(resolved);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fallbackStatic: MetadataRoute.Sitemap = ['', '/about', '/products', '/services', '/blog', '/contact'].map((path) => ({
    url: path ? absoluteUrl(path) : SITE_URL,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));

  try {
    await connectDB();

    const [products, services, blogs, homepage, settings] = await Promise.all([
      Product.find({}, { slug: 1, updatedAt: 1, heroImage: 1, image: 1, title: 1 }).lean(),
      Service.find({ active: { $ne: false } }, { slug: 1, updatedAt: 1, image: 1, imageUrl: 1, coverImage: 1 }).lean(),
      Blog.find({ status: 'published' }, { slug: 1, updatedAt: 1, publishedAt: 1, coverImage: 1, heroImage: 1 }).lean(),
      HomepageContent.findOne({}, { updatedAt: 1 }).lean(),
      SiteSettings.findOne({}, { updatedAt: 1 }).lean(),
    ]);

    const productsUpdated = newestUpdate(products as any[]);
    const servicesUpdated = newestUpdate(services as any[]);
    const blogsUpdated = newestUpdate(blogs as any[]);
    const settingsUpdated = newestUpdate([settings as any, homepage as any]);

    // Real content timestamps, not the time of the request. A lastmod that always
    // reads "now" is a signal Google learns to ignore.
    const staticLastModified: Record<string, Date | undefined> = {
      '': newestUpdate([homepage as any], products as any[], services as any[], blogs as any[]),
      '/about': settingsUpdated,
      '/products': productsUpdated,
      '/services': servicesUpdated,
      '/blog': blogsUpdated,
      '/contact': settingsUpdated,
    };

    const staticPages: MetadataRoute.Sitemap = ['', '/about', '/products', '/services', '/blog', '/contact'].map((path) => ({
      url: path ? absoluteUrl(path) : SITE_URL,
      lastModified: staticLastModified[path],
      changeFrequency: path === '' || path === '/blog' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
    }));

    const productPages: MetadataRoute.Sitemap = products
      .filter((product: any) => product.slug)
      .map((product: any) => {
        const image = absoluteImage(product.heroImage || product.image);
        return {
          url: absoluteUrl(`/products/${product.slug}`),
          lastModified: product.updatedAt || undefined,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
          ...(image ? { images: [image] } : {}),
        };
      });

    const servicePages: MetadataRoute.Sitemap = services
      .filter((service: any) => service.slug)
      .map((service: any) => {
        const image = absoluteImage(service.image || service.imageUrl || service.coverImage);
        return {
          url: absoluteUrl(`/services/${service.slug}`),
          lastModified: service.updatedAt || undefined,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
          ...(image ? { images: [image] } : {}),
        };
      });

    const blogPages: MetadataRoute.Sitemap = blogs
      .filter((blog: any) => blog.slug)
      .map((blog: any) => {
        const image = absoluteImage(blog.coverImage || blog.heroImage);
        return {
          url: absoluteUrl(`/blog/${blog.slug}`),
          lastModified: blog.updatedAt || blog.publishedAt || undefined,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
          ...(image ? { images: [image] } : {}),
        };
      });

    return [...staticPages, ...productPages, ...servicePages, ...blogPages];
  } catch (error) {
    console.warn('[sitemap] falling back to static routes only', error);
    return fallbackStatic;
  }
}
