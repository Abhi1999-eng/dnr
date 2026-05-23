import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/models/Blog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  await connectDB();
  const blog = await Blog.findOne({ slug, status: 'published' }).lean();

  if (!blog) {
    return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
  }

  return NextResponse.json(blog);
}
