import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/models/Content';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  await connectDB();
  const entries = await Content.find();
  const formatted: Record<string, any> = {};
  entries.forEach((c) => (formatted[c.key] = c.data));
  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json(); // { key, data }
  await connectDB();
  const upserted = await Content.findOneAndUpdate({ key: body.key }, { data: body.data }, { upsert: true, new: true });
  return NextResponse.json(upserted);
}
