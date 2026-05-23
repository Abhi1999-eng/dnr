import { unstable_cache, unstable_noStore as noStore } from 'next/cache';
import { connectDB } from './db';
import { Service } from '@/models/Service';
import { Testimonial } from '@/models/Testimonial';
import { Content } from '@/models/Content';
import { Product } from '@/models/Product';
import { HomepageContent } from '@/models/HomepageContent';
import { SiteSettings } from '@/models/SiteSettings';
import { ClientLogo } from '@/models/ClientLogo';
import { Blog } from '@/models/Blog';

const serialize = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const getPublicData = unstable_cache(
  async () => {
    await connectDB();
    const [services, testimonials, contents, products, homepage, settings, clientLogos] = await Promise.all([
      Service.find({ active: { $ne: false } }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
      Testimonial.find().sort({ createdAt: -1 }).lean(),
      Content.find().lean(),
      Product.find().sort({ createdAt: -1 }).lean(),
      HomepageContent.findOne().lean(),
      SiteSettings.findOne().lean(),
      ClientLogo.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    ]);
    const contentMap: Record<string, any> = {};
    contents.forEach((c: any) => (contentMap[c.key] = c.data));
    return {
      services: serialize(services),
      testimonials: serialize(testimonials),
      products: serialize(products),
      homepage: serialize(homepage || {}),
      settings: serialize(settings || {}),
      clientLogos: serialize(clientLogos || []),
      contents: contentMap,
    };
  },
  ['public-data'],
  { revalidate: 300, tags: ['public-data', 'settings', 'homepage', 'products', 'services', 'testimonials', 'client-logos'] }
);

export async function fetchPublicData(): Promise<any> {
  return getPublicData();
}

export async function fetchLiveClientLogos(): Promise<any[]> {
  noStore();
  await connectDB();
  const logos = await ClientLogo.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return serialize(logos || []);
}

export async function fetchLiveProducts(): Promise<any[]> {
  noStore();
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return serialize(products || []);
}

export const fetchProductBySlug = unstable_cache(
  async (slug: string) => {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    return serialize(product || null);
  },
  ['product-by-slug'],
  { revalidate: 300, tags: ['products'] }
);

export const fetchRelatedProducts = unstable_cache(
  async (excludeId?: string, limit = 3) => {
    await connectDB();
    const query = excludeId ? { _id: { $ne: excludeId } } : {};
    const related = await Product.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return serialize(related || []);
  },
  ['related-products'],
  { revalidate: 300, tags: ['products'] }
);

export const fetchServiceBySlug = unstable_cache(
  async (slug: string) => {
    await connectDB();
    const service = await Service.findOne({ slug, active: { $ne: false } }).lean();
    return serialize(service || null);
  },
  ['service-by-slug'],
  { revalidate: 300, tags: ['services'] }
);

export const fetchRelatedServices = unstable_cache(
  async (slug: string, limit = 3) => {
    await connectDB();
    const related = await Service.find({ slug: { $ne: slug }, active: { $ne: false } })
      .sort({ sortOrder: 1, createdAt: 1 })
      .limit(limit)
      .lean();
    return serialize(related || []);
  },
  ['related-services'],
  { revalidate: 300, tags: ['services'] }
);

export const fetchPublishedBlogs = unstable_cache(
  async () => {
    await connectDB();
    const blogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).lean();
    return serialize(blogs || []);
  },
  ['published-blogs'],
  { revalidate: 300, tags: ['blogs'] }
);

export const fetchBlogBySlug = unstable_cache(
  async (slug: string) => {
    await connectDB();
    const blog = await Blog.findOne({ slug, status: 'published' }).lean();
    return serialize(blog || null);
  },
  ['blog-by-slug'],
  { revalidate: 300, tags: ['blogs'] }
);

export const fetchLatestBlogs = unstable_cache(
  async (excludeSlug?: string, limit = 4) => {
    await connectDB();
    const blogs = await Blog.find({
      status: 'published',
      ...(excludeSlug ? { slug: { $ne: excludeSlug } } : {}),
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return serialize(blogs || []);
  },
  ['latest-blogs'],
  { revalidate: 300, tags: ['blogs'] }
);

export async function fetchProductsByIds(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  noStore();
  await connectDB();
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((item: any) => [String(item._id), item]));
  return ids.map((id) => byId.get(id)).filter(Boolean).map((item) => serialize(item));
}
