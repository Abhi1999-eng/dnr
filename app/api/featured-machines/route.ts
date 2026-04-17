import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeaturedMachine } from '@/models/FeaturedMachine';
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
  const machines = await FeaturedMachine.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return NextResponse.json(machines);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.slug) body.slug = slugify(body.title || 'featured-machine');
  await connectDB();
  const created = await FeaturedMachine.create(body);
  return NextResponse.json(created, { status: 201 });
}
