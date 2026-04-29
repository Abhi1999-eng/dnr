import { copyFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { sanitizeUploadFilename } from '../lib/media.js';
import { filenameToProductTitle, slugifyProduct, BULK_IMAGE_EXTENSIONS } from '../lib/product-import.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dnr-modern';
const DEFAULT_SHORT_DESCRIPTION = 'Industrial machinery and support equipment.';

function isValidImage(filename: string) {
  return BULK_IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function buildStoredFilename(filename: string) {
  return `${Date.now()}-${sanitizeUploadFilename(filename)}`;
}

async function run() {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.error('Usage: node --loader ts-node/esm scripts/import-products-from-images.ts <directory>');
    process.exit(1);
  }

  const sourceDir = path.resolve(inputDir);
  const sourceStats = await stat(sourceDir).catch(() => null);
  if (!sourceStats?.isDirectory()) {
    console.error(`Directory not found: ${sourceDir}`);
    process.exit(1);
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const entries = (await (await import('fs/promises')).readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && isValidImage(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const summary = { created: 0, updated: 0, skipped: 0, failed: 0 };
  const details: Array<{ filename: string; slug: string; status: string; reason: string; image: string }> = [];

  for (const filename of entries) {
    try {
      const title = filenameToProductTitle(filename);
      const slug = slugifyProduct(title);
      if (!slug) {
        summary.failed += 1;
        details.push({ filename, slug, status: 'failed', reason: 'Invalid slug derived from filename', image: '' });
        continue;
      }

      const storedFilename = buildStoredFilename(filename);
      const sourcePath = path.join(sourceDir, filename);
      const destinationPath = path.join(uploadsDir, storedFilename);
      await copyFile(sourcePath, destinationPath);
      const imageUrl = `/uploads/${storedFilename}`;

      const existing = await Product.findOne({ slug });
      if (existing) {
        existing.title = title;
        existing.shortDescription = existing.shortDescription || DEFAULT_SHORT_DESCRIPTION;
        existing.description = existing.description || '';
        existing.image = imageUrl;
        existing.heroImage = imageUrl;
        if (!Array.isArray(existing.gallery)) existing.gallery = [];
        if (!Array.isArray(existing.specs)) existing.specs = [];
        if (!Array.isArray(existing.applications)) existing.applications = [];
        if (!Array.isArray(existing.features)) existing.features = [];
        existing.seo = {
          ...(existing.seo || {}),
          title,
          description: existing.shortDescription || DEFAULT_SHORT_DESCRIPTION,
          ogImage: imageUrl,
        };
        await existing.save();
        summary.updated += 1;
        details.push({ filename, slug, status: 'updated', reason: 'Existing product updated', image: imageUrl });
        continue;
      }

      await Product.create({
        title,
        slug,
        shortDescription: DEFAULT_SHORT_DESCRIPTION,
        description: '',
        image: imageUrl,
        heroImage: imageUrl,
        gallery: [],
        specs: [],
        applications: [],
        features: [],
        seo: {
          title,
          description: DEFAULT_SHORT_DESCRIPTION,
          ogImage: imageUrl,
        },
      });
      summary.created += 1;
      details.push({ filename, slug, status: 'created', reason: 'Product created', image: imageUrl });
    } catch (error) {
      summary.failed += 1;
      details.push({
        filename,
        slug: '',
        status: 'failed',
        reason: error instanceof Error ? error.message : 'Unknown error',
        image: '',
      });
    }
  }

  console.log(JSON.stringify({ directory: sourceDir, totalFiles: entries.length, summary, details }, null, 2));
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
