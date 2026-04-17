import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { verifyToken } from '@/lib/auth';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeProductPayload(body: any) {
  const heroImage = body.heroImage || body.image || '';
  return {
    title: body.title || '',
    slug: body.slug || slugify(body.title || 'product'),
    shortDescription: body.shortDescription || '',
    description: body.description || '',
    image: body.image || heroImage,
    heroImage,
    gallery: Array.isArray(body.gallery) ? body.gallery.filter(Boolean) : [],
    specs: Array.isArray(body.specs) ? body.specs : [],
    applications: Array.isArray(body.applications) ? body.applications.filter(Boolean) : [],
    features: Array.isArray(body.features) ? body.features.filter(Boolean) : [],
    seo: body.seo || {},
  };
}

export async function GET() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const created = await Product.create(normalizeProductPayload(body));
  return NextResponse.json(created, { status: 201 });
}
