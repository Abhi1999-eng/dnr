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

export async function GET() {
  await connectDB();
  const products = await Product.find().populate('category').lean();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  if (!body.slug) body.slug = slugify(body.title);
  const created = await Product.create(body);
  return NextResponse.json(created, { status: 201 });
}
