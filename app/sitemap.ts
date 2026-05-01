import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { Service } from '@/models/Service';
import { absoluteUrl, SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/products',
    '/services',
    '/contact',
  ].map((path) => ({
    url: path ? absoluteUrl(path) : SITE_URL,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));

  try {
    await connectDB();

    const [products, services] = await Promise.all([
      Product.find({}, { slug: 1, updatedAt: 1 }).lean(),
      Service.find({ active: { $ne: false } }, { slug: 1, updatedAt: 1 }).lean(),
    ]);

    const productPages: MetadataRoute.Sitemap = products
    .filter((product: any) => product.slug)
    .map((product: any) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    const servicePages: MetadataRoute.Sitemap = services
    .filter((service: any) => service.slug)
    .map((service: any) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: service.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...servicePages];
  } catch (error) {
    console.warn('[sitemap] falling back to static routes only', error);
    return staticPages;
  }
}
