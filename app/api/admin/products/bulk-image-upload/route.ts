import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { filenameToProductTitle, isAcceptedImageFile, MAX_BULK_IMAGE_SIZE_BYTES, slugifyProduct } from '@/lib/product-import';
import { storeUploadedImage } from '@/lib/upload-storage';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type UploadStatus = 'created' | 'skipped' | 'failed';

type UploadResult = {
  filename: string;
  title: string;
  slug: string;
  status: UploadStatus;
  reason: string;
};

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!files.length) {
    return NextResponse.json({ message: 'No image files provided' }, { status: 400 });
  }

  await connectDB();

  const existingProducts = await Product.find({}, { slug: 1 }).lean();
  const existingSlugs = new Set(existingProducts.map((product: any) => product.slug).filter(Boolean));
  const batchSlugs = new Set<string>();
  const results: UploadResult[] = [];
  const createdSlugs: string[] = [];

  for (const file of files) {
    const title = filenameToProductTitle(file.name);
    const slug = slugifyProduct(title);

    if (!isAcceptedImageFile(file)) {
      results.push({ filename: file.name, title, slug, status: 'failed', reason: 'Unsupported file type' });
      continue;
    }

    if (file.size > MAX_BULK_IMAGE_SIZE_BYTES) {
      results.push({ filename: file.name, title, slug, status: 'failed', reason: 'File exceeds 12 MB limit' });
      continue;
    }

    if (!slug) {
      results.push({ filename: file.name, title, slug, status: 'failed', reason: 'Could not derive a valid product slug' });
      continue;
    }

    if (batchSlugs.has(slug)) {
      results.push({ filename: file.name, title, slug, status: 'skipped', reason: 'Duplicate filename in current upload batch' });
      continue;
    }

    if (existingSlugs.has(slug)) {
      results.push({ filename: file.name, title, slug, status: 'skipped', reason: 'Product already exists' });
      batchSlugs.add(slug);
      continue;
    }

    try {
      const imageUrl = await storeUploadedImage(file);
      await Product.create({
        title,
        slug,
        shortDescription: 'Industrial machinery and support equipment.',
        description: '',
        image: imageUrl,
        heroImage: imageUrl,
        gallery: [],
        specs: [],
        applications: [],
        features: [],
        seo: {},
      });

      batchSlugs.add(slug);
      existingSlugs.add(slug);
      createdSlugs.push(slug);
      results.push({ filename: file.name, title, slug, status: 'created', reason: 'Product created successfully' });
    } catch (error) {
      results.push({
        filename: file.name,
        title,
        slug,
        status: 'failed',
        reason: error instanceof Error ? error.message : 'Unexpected error while creating product',
      });
    }
  }

  if (createdSlugs.length) {
    revalidateTag('products', 'max');
    revalidateTag('public-data', 'max');
    revalidatePath('/');
    revalidatePath('/products');
    createdSlugs.forEach((slug) => revalidatePath(`/products/${slug}`));
  }

  const summary = {
    created: results.filter((item) => item.status === 'created').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
    failed: results.filter((item) => item.status === 'failed').length,
    total: results.length,
  };

  return NextResponse.json({ summary, results });
}
