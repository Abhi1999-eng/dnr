import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
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

async function getId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id;
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const id = await getId(context);
  await connectDB();
  const updated = await Product.findByIdAndUpdate(id, normalizeProductPayload(body), { new: true, runValidators: true });
  if (!updated) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  revalidateTag('products', 'max');
  revalidateTag('public-data', 'max');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = await getId(context);
  await connectDB();
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  revalidateTag('products', 'max');
  revalidateTag('public-data', 'max');
  return NextResponse.json({ success: true, id });
}
