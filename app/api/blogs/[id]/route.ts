import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Blog } from '@/models/Blog';
import { normalizeBlogPayload, validateBlogPayload } from '@/lib/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id;
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const id = await getId(context);
  const existing = await Blog.findById(id).lean();
  if (!existing) {
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
  }

  const body = await req.json();
  const payload = await normalizeBlogPayload(body, id);
  const validationError = validateBlogPayload(payload);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const updated = await Blog.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  revalidateTag('blogs', 'max');
  revalidatePath('/blog');
  revalidatePath('/');
  if ((existing as any).slug) {
    revalidatePath(`/blog/${(existing as any).slug}`);
  }
  if (updated?.slug) {
    revalidatePath(`/blog/${updated.slug}`);
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const id = await getId(context);
  const deleted = await Blog.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
  }

  revalidateTag('blogs', 'max');
  revalidatePath('/blog');
  revalidatePath('/');
  if (deleted.slug) {
    revalidatePath(`/blog/${deleted.slug}`);
  }
  return NextResponse.json({ success: true, id });
}
