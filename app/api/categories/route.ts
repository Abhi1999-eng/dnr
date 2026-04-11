import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const created = await Category.create(body);
  return NextResponse.json(created, { status: 201 });
}
