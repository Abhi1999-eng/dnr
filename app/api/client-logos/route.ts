import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ClientLogo } from '@/models/ClientLogo';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const logos = await ClientLogo.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  return NextResponse.json(logos);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const created = await ClientLogo.create(body);
  return NextResponse.json(created, { status: 201 });
}
