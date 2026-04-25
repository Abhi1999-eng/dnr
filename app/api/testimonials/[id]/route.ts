import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { verifyToken } from '@/lib/auth';

async function authorize(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  return token && verifyToken(token);
}

export async function PUT(req: NextRequest, context: RouteContext<'/api/testimonials/[id]'>) {
  if (!(await authorize(req))) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = await context.params;

  await connectDB();
  const updated = await Testimonial.findByIdAndUpdate(id, body, { new: true });
  revalidateTag('testimonials', 'max');
  revalidateTag('public-data', 'max');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: RouteContext<'/api/testimonials/[id]'>) {
  if (!(await authorize(req))) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  await connectDB();
  await Testimonial.findByIdAndDelete(id);
  revalidateTag('testimonials', 'max');
  revalidateTag('public-data', 'max');
  return NextResponse.json({ success: true });
}
