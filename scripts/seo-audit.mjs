#!/usr/bin/env node
/**
 * Crawls the sitemap and asserts the on-page SEO invariants this site relies on.
 *
 * The point is regression safety: titles, descriptions, canonicals and JSON-LD
 * were all corrected by hand, and any CMS edit or template change can undo that
 * silently. This fails loudly instead.
 *
 *   node scripts/seo-audit.mjs                      # audit production
 *   node scripts/seo-audit.mjs --base http://localhost:3000
 *   node scripts/seo-audit.mjs --json report.json   # also write a machine-readable report
 */

import { writeFileSync } from 'node:fs';
import { MAX_SERP_TITLE_LENGTH, MIN_META_DESCRIPTION_LENGTH } from './seo-limits.mjs';

const MAX_META_DESCRIPTION_LENGTH = 165;
const REQUEST_TIMEOUT_MS = 45000;
const CONCURRENCY = 4;

function parseArgs(argv) {
  const args = { base: 'https://dnrtechnoservices.com', json: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--base') args.base = argv[++i];
    else if (argv[i] === '--json') args.json = argv[++i];
  }
  args.base = args.base.replace(/\/$/, '');
  return args;
}

const decode = (value) =>
  String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&apos;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'dnr-seo-audit/1.0' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return { status: response.status, body: await response.text() };
}

/** Page kind drives which JSON-LD types are required. */
function classify(path) {
  if (path === '/' || path === '') return 'home';
  if (/^\/(products|services|blog)$/.test(path)) return 'listing';
  if (/^\/products\/[^/]+$/.test(path)) return 'product';
  if (/^\/services\/[^/]+$/.test(path)) return 'service';
  if (/^\/blog\/[^/]+$/.test(path)) return 'article';
  return 'page';
}

const REQUIRED_SCHEMA = {
  home: ['Organization', 'WebSite', 'LocalBusiness'],
  listing: ['BreadcrumbList'],
  product: ['BreadcrumbList', 'WebPage'],
  service: ['BreadcrumbList', 'WebPage'],
  article: ['BreadcrumbList', 'Article'],
  page: ['BreadcrumbList'],
};

function auditPage(url, path, status, html) {
  const problems = [];
  const add = (code, detail) => problems.push({ code, detail });

  if (status !== 200) {
    add('http-status', `returned ${status}`);
    return { url, path, problems, title: '', description: '' };
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decode(titleMatch?.[1]);
  if (!title) add('title-missing', 'no <title>');
  else if (title.length > MAX_SERP_TITLE_LENGTH) add('title-too-long', `${title.length} chars (max ${MAX_SERP_TITLE_LENGTH}): ${title}`);

  const descMatch = html.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i);
  const description = decode(descMatch?.[1]);
  if (!description) add('description-missing', 'no meta description');
  else if (description.length < MIN_META_DESCRIPTION_LENGTH)
    add('description-too-short', `${description.length} chars (min ${MIN_META_DESCRIPTION_LENGTH})`);
  else if (description.length > MAX_META_DESCRIPTION_LENGTH)
    add('description-too-long', `${description.length} chars (max ${MAX_META_DESCRIPTION_LENGTH})`);

  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length !== 1) add('h1-count', `${h1s.length} <h1> elements, expected exactly 1`);

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (!canonical) add('canonical-missing', 'no canonical link');
  else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, ''))
    add('canonical-mismatch', `canonical is ${canonical}, expected ${url}`);

  if (!/<meta\s+property="og:image"\s+content="[^"]+"/i.test(html)) add('og-image-missing', 'no og:image');

  // Every <img> needs non-empty alt text.
  const noAlt = (html.match(/<img\b[^>]*>/gi) || []).filter((tag) => !/\balt\s*=\s*"[^"]+"/i.test(tag));
  if (noAlt.length) add('img-alt-missing', `${noAlt.length} <img> without alt text`);

  const types = [];
  for (const block of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
    const raw = block.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
    try {
      const parsed = JSON.parse(raw);
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        if (node?.['@type']) types.push(node['@type']);
      }
    } catch {
      add('schema-invalid', 'a JSON-LD block does not parse');
    }
  }
  const kind = classify(path);
  for (const required of REQUIRED_SCHEMA[kind] || []) {
    if (!types.includes(required)) add('schema-missing', `${kind} page is missing ${required} JSON-LD`);
  }

  // Strip attributes before looking for placeholder copy: form inputs legitimately
  // carry placeholder="..." and matching those reported every product page.
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const placeholderCopy = visibleText.match(/\b(lorem ipsum|dummy|sample testimonial|test testimonial)\b/i);
  if (placeholderCopy) add('placeholder-text', `placeholder copy in page text: "${placeholderCopy[0]}"`);

  return { url, path, kind, problems, title, description };
}

async function mapLimit(items, limit, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        out[index] = await worker(items[index]);
      }
    })
  );
  return out;
}

async function main() {
  const { base, json } = parseArgs(process.argv.slice(2));
  console.log(`[seo-audit] auditing ${base}`);

  const { status, body } = await fetchText(`${base}/sitemap.xml`);
  if (status !== 200) {
    console.error(`[seo-audit] sitemap.xml returned ${status}`);
    process.exit(1);
  }

  const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!urls.length) {
    console.error('[seo-audit] sitemap contained no URLs');
    process.exit(1);
  }
  console.log(`[seo-audit] ${urls.length} URLs in sitemap\n`);

  const results = await mapLimit(urls, CONCURRENCY, async (url) => {
    const path = new URL(url).pathname.replace(/\/$/, '') || '/';
    const target = url.startsWith(base) ? url : `${base}${path}`;
    try {
      const page = await fetchText(target);
      return auditPage(url, path, page.status, page.body);
    } catch (error) {
      return { url, path, problems: [{ code: 'fetch-failed', detail: String(error?.message || error) }], title: '', description: '' };
    }
  });

  // Duplicate titles and descriptions are only visible across the whole crawl.
  for (const field of ['title', 'description']) {
    const seen = new Map();
    for (const row of results) {
      const value = row[field];
      if (!value) continue;
      if (seen.has(value)) {
        row.problems.push({ code: `duplicate-${field}`, detail: `same ${field} as ${seen.get(value)}` });
      } else {
        seen.set(value, row.path);
      }
    }
  }

  const failed = results.filter((r) => r.problems.length);
  for (const row of failed) {
    console.log(`FAIL  ${row.path}`);
    for (const problem of row.problems) console.log(`        ${problem.code}: ${problem.detail}`);
  }

  const totalProblems = failed.reduce((sum, r) => sum + r.problems.length, 0);
  console.log(
    `\n[seo-audit] ${results.length - failed.length}/${results.length} pages clean` +
      (totalProblems ? `, ${totalProblems} problem(s) across ${failed.length} page(s)` : '')
  );

  if (json) {
    writeFileSync(json, JSON.stringify({ base, checkedAt: new Date().toISOString(), results }, null, 2));
    console.log(`[seo-audit] report written to ${json}`);
  }

  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error('[seo-audit] crashed:', error);
  process.exit(1);
});
