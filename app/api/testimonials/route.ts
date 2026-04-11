import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const items = await Testimonial.find().sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const created = await Testimonial.create(body);
  return NextResponse.json(created, { status: 201 });
}
