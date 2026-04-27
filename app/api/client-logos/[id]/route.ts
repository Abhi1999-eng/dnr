export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { ClientLogo } from '@/models/ClientLogo';
import { verifyToken } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const body = await req.json();
  console.log('[logos] update payload:', { id, ...body });
  await connectDB();
  const updated = await ClientLogo.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  revalidateTag('client-logos', 'max');
  revalidateTag('public-data', 'max');
  revalidatePath('/');
  return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function DELETE(req: Request, context: RouteContext) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  await connectDB();
  await ClientLogo.findByIdAndDelete(id);
  revalidateTag('client-logos', 'max');
  revalidateTag('public-data', 'max');
  revalidatePath('/');
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
