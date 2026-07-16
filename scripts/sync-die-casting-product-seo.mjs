#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dataPath = path.join(rootDir, 'data', 'die-casting-product-seo.json');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dnr-modern';

const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const productSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    shortDescription: String,
    description: String,
    specs: [{ label: String, value: String }],
    applications: [String],
    features: [String],
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { strict: false, collection: 'products' }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function main() {
  await mongoose.connect(mongoUri, { bufferCommands: false });

  const updates = [];

  for (const [slug, content] of Object.entries(payload)) {
    const updatePayload = {
      shortDescription: content.shortDescription || '',
      description: content.longDescription || '',
      features: content.overview || [],
      applications: content.industries || [],
      seo: {
        title: content.metadataTitle,
        description: content.metadataDescription,
      },
    };

    const result = await Product.updateOne({ slug }, { $set: updatePayload });
    updates.push({
      slug,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  console.log(
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        database: mongoUri.replace(/\/\/.*@/, '//***@'),
        updates,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
