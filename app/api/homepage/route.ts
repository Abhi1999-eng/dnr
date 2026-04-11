import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { HomepageContent } from '@/models/HomepageContent';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const doc = await HomepageContent.findOne().lean();
  return NextResponse.json(doc || {});
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const doc = await HomepageContent.findOneAndUpdate({}, body, { upsert: true, new: true });
  return NextResponse.json(doc);
}
