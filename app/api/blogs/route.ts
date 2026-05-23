import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Blog } from '@/models/Blog';
import { normalizeBlogPayload, validateBlogPayload } from '@/lib/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAdminRequest(req: NextRequest) {
  return req.nextUrl.searchParams.get('scope') === 'admin';
}

export async function GET(req: NextRequest) {
  await connectDB();

  if (isAdminRequest(req)) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const blogs = await Blog.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
    return NextResponse.json({ blogs });
  }

  const blogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1, createdAt: -1 }).lean();
  return NextResponse.json({ blogs });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  await connectDB();
  const payload = await normalizeBlogPayload(body);
  const validationError = validateBlogPayload(payload);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const created = await Blog.create(payload);
  revalidateTag('blogs', 'max');
  revalidatePath('/blog');
  revalidatePath('/');
  if (created.slug) {
    revalidatePath(`/blog/${created.slug}`);
  }
  return NextResponse.json({ blog: created }, { status: 201 });
}
