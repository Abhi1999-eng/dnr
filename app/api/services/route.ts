import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const items = await Service.find().sort({ sortOrder: 1, createdAt: 1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  await connectDB();
  const created = await Service.create(body);
  return NextResponse.json(created, { status: 201 });
}
