import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SiteSettings } from '@/models/SiteSettings';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const settings = await SiteSettings.findOne().lean();
  return NextResponse.json(settings || {});
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
  const settings = await SiteSettings.findOneAndUpdate({}, body, { upsert: true, new: true });
  return NextResponse.json(settings);
}
