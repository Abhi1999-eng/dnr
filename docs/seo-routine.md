# DNR SEO routine

The cadence that keeps this site's search performance from drifting. Written for
whoever picks this up, not only for the person who set it up.

## Daily — automated, no one has to do anything

`.github/workflows/seo-audit.yml` runs `npm run seo:audit` against the live site
every night. It crawls the sitemap and fails if any page breaks an invariant:
HTTP 200, one `<h1>`, title within 65 characters, description between 110 and
165, a self-referencing canonical, an `og:image`, alt text on every image, the
JSON-LD that page type needs, no placeholder copy, no duplicate titles or
descriptions.

**You only act when it fails.** A failure means something changed — usually a CMS
edit. The run keeps a JSON report as an artifact.

Run it by hand against a dev server with `npm run seo:audit:local`.

## Weekly — 20 minutes, needs Search Console

1. **Coverage.** Search Console → Pages. Look for newly excluded URLs. A page that
   moves to "Crawled - currently not indexed" usually has thin or duplicated content.
2. **Striking distance.** Performance → Queries, last 28 days. Sort by impressions
   and find queries sitting at **position 5-20**. These are the cheapest wins: the
   page already ranks, it just is not on page one. Usually fixed by answering that
   query more directly on the page that already ranks, not by writing a new one.
3. **Impressions without clicks.** Queries with real impressions and a CTR near
   zero are a title and description problem, not a ranking problem. Rewrite the
   metadata for the page that serves them.
4. **Pick the week's topics** from 2 and 3, not from a topic list written in advance.

## Content — 2 to 3 posts a week

Posts are written as Markdown in `content/blog/`, reviewed in a pull request, and
imported with `npm run blog:import`. They are not typed into the admin panel, so
they get version control and review.

```bash
npm run blog:check     # validate front matter and lengths, write nothing
npm run blog:import    # upsert into the CMS, matched on slug
```

The importer refuses anything that would fail the SEO audit — an over-long
`seoTitle`, a description outside 110-165, a missing field, an `h1` in the body
(the page title is the single `h1`, so body headings start at `##`).

### What makes a post worth publishing here

The audience is a plant engineer or a technical buyer. They can tell filler apart
from useful writing in one paragraph.

- **Answer one real question** — ideally one that showed up in Search Console.
- **Answer it early.** Put a direct answer in the first two paragraphs. This is also
  what gives a page any chance of being cited in an AI Overview.
- **Use question-shaped `##` headings** that match how people actually search.
- **Link to the relevant products and services.** This is how Google learns which
  pages on the site relate to each other.
- **Do not assert what cannot be verified.** No tonnage, cycle time, certification,
  client name or performance claim unless someone who knows the machines supplied
  it. A wrong number in front of a technical buyer costs more than a missing one.

### Why not more than 2-3 a week

Google's scaled content abuse policy targets mass-produced content made mainly to
rank. The penalty applies to the site, not just the posts. For a niche where the
genuinely useful topics number in the dozens rather than the hundreds, volume
beyond a few a week turns into repetition, and repetition drags the whole domain.

## Monthly

- Re-run the [SEO checklist](seo-checklist.md) against representative pages.
- Validate structured data on one page of each type with the Rich Results Test.
- Check Core Web Vitals. The homepage ships roughly 575 KB of HTML with 56 images
  and is the most likely drag.
- Review the [Google Business Profile](google-business-profile.md): new photos,
  reply to reviews, post an update.

## What automation cannot do

Rankings and AI Overview citations are not automatable. Google publishes no way to
opt into AI Overviews, no API for it, and Search Console does not separate those
impressions from ordinary web search. What is automatable is everything around it:
catching regressions, surfacing which queries are close to page one, keeping
structured data valid, and making sure new content is answer-shaped before it
ships.
