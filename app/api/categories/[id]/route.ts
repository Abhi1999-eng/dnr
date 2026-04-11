import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: any) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const updated = await Category.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: any) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await connectDB();
  await Category.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
