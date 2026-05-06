import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { verifyToken } from '@/lib/auth';

async function authorize(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  return token && verifyToken(token);
}

export async function PUT(req: NextRequest, context: RouteContext<'/api/services/[id]'>) {
  if (!(await authorize(req))) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = await context.params;

  const payload = {
    ...body,
    image: body.image ?? body.imageUrl ?? body.coverImage ?? '',
  };

  await connectDB();
  const existing: any = await Service.findById(id).lean();
  const updated: any = await Service.findByIdAndUpdate(id, payload, { new: true });
  revalidateTag('services', 'max');
  revalidateTag('public-data', 'max');
  revalidatePath('/');
  revalidatePath('/services');
  if (existing?.slug) revalidatePath(`/services/${existing.slug}`);
  if (updated?.slug && updated.slug !== existing?.slug) revalidatePath(`/services/${updated.slug}`);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: RouteContext<'/api/services/[id]'>) {
  if (!(await authorize(req))) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  await connectDB();
  const existing: any = await Service.findById(id).lean();
  await Service.findByIdAndDelete(id);
  revalidateTag('services', 'max');
  revalidateTag('public-data', 'max');
  revalidatePath('/');
  revalidatePath('/services');
  if (existing?.slug) revalidatePath(`/services/${existing.slug}`);
  return NextResponse.json({ success: true });
}
