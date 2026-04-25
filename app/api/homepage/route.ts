import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
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
  delete body._id;
  delete body.__v;
  delete body.createdAt;
  delete body.updatedAt;
  await connectDB();
  const doc = await HomepageContent.findOneAndUpdate({}, body, { upsert: true, new: true });
  revalidateTag('homepage', 'max');
  revalidateTag('public-data', 'max');
  return NextResponse.json(doc);
}
