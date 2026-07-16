# Search Console local setup

This document tracks the local-only Search Console integration for DNR Techno Services.

## Local credential path
- Service account key path:
  - `~/.config/dnr/search-console-service-account.json`
- Local env vars in `.env.local`:
  - `GOOGLE_APPLICATION_CREDENTIALS`
  - `SEARCH_CONSOLE_PROPERTY_URL`

## Verify access locally
Run:

```bash
npm run search-console:verify
```

Expected output includes:
- `hasPropertyAccess: true`
- `permissionLevel` for `https://dnrtechnoservices.com/`

## Local helper workflow

### 1. Submit the live sitemap through Search Console
This is the correct replacement for the old public sitemap ping URL.

```bash
npm run search-console:submit-sitemap
```

Optional env override:

```bash
SEARCH_CONSOLE_SITEMAP_URL=https://dnrtechnoservices.com/sitemap.xml
```

### 2. Inspect important URLs directly
Single URL:

```bash
npm run search-console:inspect -- --url https://dnrtechnoservices.com/products/cnc-turning-machines
```

Multiple URLs from a text file:

```bash
npm run search-console:inspect -- --urls-file ./tmp/urls.txt --limit 10
```

Inspect live URLs pulled from the sitemap:

```bash
npm run search-console:inspect:sitemap -- --limit 8
```

JSON output for scripting:

```bash
npm run search-console:inspect -- --from-sitemap https://dnrtechnoservices.com/sitemap.xml --limit 5 --output json
```

## What this setup is good for
- Confirming Search Console access
- Submitting the sitemap from a local helper without opening the Search Console UI
- Inspecting whether key URLs are indexed, canonicalized, crawlable, and recently crawled
- Supporting future reporting or monitoring scripts

## Important limitation
Google does not guarantee automatic indexing just because API access exists.
For normal web pages, indexing still depends on:
- crawlability
- sitemap discovery
- internal links
- canonical correctness
- content quality

Also important:
- Google removed the old public sitemap ping endpoint in June 2023.
- The URL Inspection API shows index status for the Google index; it does not perform a live "request indexing" action for normal web pages.

## Recommended workflow for new pages
1. Publish the page publicly
2. Ensure it is linked internally
3. Ensure it appears in `sitemap.xml`
4. Run `npm run search-console:submit-sitemap`
5. Run `npm run search-console:inspect -- --url <page-url>`
6. For high-priority pages, also use Search Console UI -> URL Inspection -> Request indexing manually
