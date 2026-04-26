import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { storeUploadedImage } from '@/lib/upload-storage';

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });
  const url = await storeUploadedImage(file);
  return NextResponse.json({ url });
}
