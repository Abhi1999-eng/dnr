import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sanitizeUploadFilename } from '@/lib/media';

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const hasS3 = bucket && region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

async function uploadToS3(file: File, buffer: Buffer) {
  if (!hasS3) return null;
  const client = new S3Client({ region });
  const key = `uploads/${Date.now()}-${sanitizeUploadFilename(file.name)}`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
      ACL: 'public-read',
    })
  );
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function storeUploadedImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const s3Url = await uploadToS3(file, buffer);
  if (s3Url) return s3Url;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${sanitizeUploadFilename(file.name)}`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

// Backward-compatible alias for any existing bulk-upload routes still using the old helper name.
export const saveUpload = storeUploadedImage;
