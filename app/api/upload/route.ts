import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const hasS3 = bucket && region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

async function uploadToS3(file: File, buffer: Buffer) {
  if (!hasS3) return null;
  const client = new S3Client({ region });
  const key = `uploads/${Date.now()}-${file.name}`.replace(/\\s+/g, '-');
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
      ACL: 'public-read',
    })
  );
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return url;
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ message: 'No file' }, { status: 400 });
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Try S3 first when credentials are present
  const s3Url = await uploadToS3(file, buffer);
  if (s3Url) return NextResponse.json({ url: s3Url });

  // Local dev fallback: save to /public/uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${file.name}`.replace(/\\s+/g, '-');
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
