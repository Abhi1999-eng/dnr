import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Inquiry } from '@/models/Inquiry';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(inquiries);
}

export async function POST(req: Request) {
  const body = await req.json();
  await connectDB();
  const created = await Inquiry.create(body);
  return NextResponse.json({ message: 'Received', id: created._id }, { status: 201 });
}
