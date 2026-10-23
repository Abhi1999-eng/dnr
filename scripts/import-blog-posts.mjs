#!/usr/bin/env node
/**
 * Imports blog posts written as Markdown files into the CMS.
 *
 * Posts live in content/blog/*.md so they are reviewed in a pull request before
 * they reach the site, instead of being typed straight into the admin panel.
 * Re-running is safe: posts are matched on slug and updated in place.
 *
 *   node scripts/import-blog-posts.mjs --dry-run
 *   node scripts/import-blog-posts.mjs
 *   node scripts/import-blog-posts.mjs --status draft
 */

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function parseArgs(argv) {
  const args = { dryRun: false, status: null, only: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--status') args.status = argv[++i];
    else if (argv[i] === '--only') args.only = argv[++i];
  }
  return args;
}

/** Minimal YAML front matter reader: scalars and `- ` lists, which is all these files use. */
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('file has no front matter block');

  const meta = {};
  let currentKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      meta[currentKey].push(stripQuotes(listItem[1]));
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, value] = pair;
    currentKey = key;
    meta[key] = value.trim() === '' ? [] : stripQuotes(value);
  }
  return { meta, body: match[2].trim() };
}

const stripQuotes = (value) => String(value).trim().replace(/^["'](.*)["']$/, '$1');

const REQUIRED = ['title', 'slug', 'excerpt', 'seoTitle', 'seoDescription', 'category'];

function validate(meta, body, file) {
  const problems = [];
  for (const key of REQUIRED) {
    if (!meta[key] || (Array.isArray(meta[key]) && !meta[key].length)) problems.push(`missing ${key}`);
  }
  // The same limits the runtime metadata helpers and the audit script enforce.
  if (meta.seoTitle && `${meta.seoTitle} | DNR Techno Services`.length > 65) {
    problems.push(`seoTitle too long: ${`${meta.seoTitle} | DNR Techno Services`.length} chars with the brand suffix`);
  }
  if (meta.seoDescription && (meta.seoDescription.length < 110 || meta.seoDescription.length > 165)) {
    problems.push(`seoDescription is ${meta.seoDescription.length} chars, expected 110-165`);
  }
  if (meta.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug)) problems.push(`slug is not kebab-case: ${meta.slug}`);
  if (body.length < 600) problems.push(`body is only ${body.length} characters`);
  // The page title is the single h1; body headings must start at h2.
  if (/^#\s/m.test(body)) problems.push('body contains an h1 (#); headings must start at h2 (##)');
  return problems.map((p) => `${file}: ${p}`);
}

async function main() {
  const { dryRun, status, only } = parseArgs(process.argv.slice(2));

  let files;
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md')).sort();
  } catch {
    console.error(`[blog-import] no ${CONTENT_DIR} directory`);
    process.exit(1);
  }
  if (only) files = files.filter((f) => f.includes(only));
  if (!files.length) {
    console.error('[blog-import] no markdown files to import');
    process.exit(1);
  }

  const posts = [];
  const problems = [];
  for (const file of files) {
    const raw = readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    try {
      const { meta, body } = parseFrontMatter(raw);
      problems.push(...validate(meta, body, file));
      posts.push({ file, meta, body });
    } catch (error) {
      problems.push(`${file}: ${error.message}`);
    }
  }

  if (problems.length) {
    console.error('[blog-import] validation failed:');
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }

  console.log(`[blog-import] ${posts.length} post(s) valid`);
  for (const { file, meta } of posts) {
    console.log(`  ${file} -> /blog/${meta.slug}  (${meta.seoTitle.length + 22} char title)`);
  }

  if (dryRun) {
    console.log('[blog-import] dry run, nothing written');
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[blog-import] MONGODB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(uri, { bufferCommands: false });
  const blogs = mongoose.connection.db.collection('blogs');

  for (const { meta, body } of posts) {
    const existing = await blogs.findOne({ slug: meta.slug });
    const doc = {
      title: meta.title,
      slug: meta.slug,
      excerpt: meta.excerpt,
      content: body,
      category: meta.category,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      seoTitle: meta.seoTitle,
      seoDescription: meta.seoDescription,
      seoKeywords: Array.isArray(meta.seoKeywords) ? meta.seoKeywords : [],
      authorName: meta.authorName || 'DNR Techno Services',
      featuredImage: meta.featuredImage || '',
      featuredImageAlt: meta.featuredImageAlt || '',
      status: status || meta.status || 'published',
      updatedAt: new Date(),
    };
    if (!existing) {
      doc.createdAt = new Date();
      doc.publishedAt = doc.status === 'published' ? new Date() : null;
      await blogs.insertOne(doc);
      console.log(`  created /blog/${meta.slug}`);
    } else {
      // Keep the original publish date so re-importing does not reorder the blog.
      if (doc.status === 'published' && !existing.publishedAt) doc.publishedAt = new Date();
      await blogs.updateOne({ _id: existing._id }, { $set: doc });
      console.log(`  updated /blog/${meta.slug}`);
    }
  }

  await mongoose.disconnect();
  console.log('[blog-import] done');
}

main().catch((error) => {
  console.error('[blog-import] failed:', error);
  process.exit(1);
});
