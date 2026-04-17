import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FeaturedMachine } from '@/models/FeaturedMachine';
import { verifyToken } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const body = await req.json();
  await connectDB();
  const updated = await FeaturedMachine.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, context: RouteContext) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  await connectDB();
  await FeaturedMachine.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
