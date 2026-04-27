export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import { ClientLogo } from '@/models/ClientLogo';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const logos = await ClientLogo.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return NextResponse.json(logos, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  console.log('[logos] create payload:', body);
  await connectDB();
  const created = await ClientLogo.create(body);
  revalidateTag('client-logos', 'max');
  revalidateTag('public-data', 'max');
  revalidatePath('/');
  return NextResponse.json(created, { status: 201, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
