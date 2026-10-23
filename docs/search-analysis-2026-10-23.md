# Search Console analysis — 2026-10-23

Pulled from Search Console for `https://dnrtechnoservices.com/`, 22 Jul – 21 Oct 2026.

| Metric | Value |
| ------ | ----: |
| Clicks | 119 |
| Impressions | 9,780 |
| CTR | 1.2% |
| Average position | 11.2 |
| Queries | 274 |
| Pages with impressions | 31 |

## The problem is click-through, not ranking

An average position of 11.2 is not the issue. A 1.2% CTR is. Of 119 clicks, **43 came
from one brand query** (`dnr techno services`, 36.8% CTR). Almost every non-brand query
in the list converts at **0%**, including queries where the site already ranks on page one.

The three pages carrying the most impressions were all running on broken or absent
metadata until today:

| Page | Impressions | CTR | Position | Metadata before today |
| ---- | ----------: | --: | -------: | --------------------- |
| `/products/aluminium-gdc-machine` | **2,870** | **0.2%** | 10.0 | 96-char title (truncated), description cut to 93 chars by the `trimDescription` bug |
| `/products/sand-mixing-machine` | 1,092 | 0.7% | 8.9 | no curated title or description at all |
| `/products/alloy-wheels-making-machines` | 863 | 1.6% | 8.9 | no curated title or description at all |
| `/products/hot-chamber-zinc-die-casting-machine` | 638 | 0.6% | 19.2 | 109-char title (truncated) |
| `/products/rotary-transfer-machine` | 380 | 1.6% | 26.6 | none |

`/products/aluminium-gdc-machine` alone is **29% of all site impressions** and returned
five clicks. The curated metadata shipped today addresses exactly these pages, so the
next 28-day window is the measurement that matters.

One page is working: `/services` converts at **17.3% from position 2.2**. It is the
proof that the rest is a snippet problem.

## The site is already in Google's AI answers

The Generative AI features report shows **2,370 impressions — 24% of all impressions**
came from AI surfaces. Pages being cited:

| Page | AI impressions |
| ---- | -------------: |
| `/products/aluminium-gdc-machine` | 942 |
| `/products/brass-gdc-machine` | 273 |
| `/products/sand-mixing-machine` | 234 |
| `/products/alloy-wheels-making-machines` | 184 |
| `/products/cold-chamber-die-casting-machine` | 158 |
| `/services/tie-bar-strain-gauge-services-…` | 108 |
| `/` | 97 |
| `/products/vertical-squeeze-casting-machines` | 89 |

This changes the brief. Getting into AI answers is not the goal to chase — it is already
happening, and the die casting and GDC pages are what Google is pulling from. Two things
follow:

1. **AI impressions rarely produce clicks.** The answer is shown in the result, so part of
   the 1.2% CTR is structural, not fixable by a better title.
2. **The pages already being cited are the ones worth deepening.** Adding specific,
   verifiable facts to the GDC and die casting pages reinforces what is already working.

Note the report gives impressions only — no query breakdown and no clicks — so this cannot
be optimised against directly. Treat it as confirmation, not a dial.

## Striking distance: ranks on page one, gets no clicks

These need better snippets, not more content. The page already ranks.

| Query | Impressions | Position |
| ----- | ----------: | -------: |
| sand mixing machine | 289 | 4.9 |
| squeeze casting machine | 169 | 4.6 |
| sand mixer machine | 114 | 5.3 |
| gdc machine | 78 | 9.6 |
| alloy machine | 38 | 3.7 |
| wheel making machine | 15 | 5.7 |
| industrial sand mixing machine | 14 | 4.0 |
| gdc aluminium casting | 11 | 6.1 |
| vmc centre | 6 | 4.3 |
| alloy wheel machining | 6 | 4.3 |

## Squeeze casting is the biggest unserved cluster

Fourteen query variants, roughly **420 impressions combined**, positions 4.6 to 18, and
almost no clicks. There is no content targeting the topic — only the product page.

`squeeze casting machine` (169 @ 4.6), `squeeze casting machine manufacturer` (47 @ 11.4),
`vertical squeeze casting machine` (41 @ 11.7), `high squeeze die casting machine` (33 @ 12.2),
`aluminum squeeze casting machine` (23 @ 13.3), `brass squeeze casting` (19 @ 12.1),
`squeeze casting machine supplier` (19 @ 13.1), `best industrial squeeze casting machines?` (14 @ 8.7),
and six more.

## Buyer intent with no page behind it

Project-cost research, consistently on page three:

- `faucet manufacturing plant cost` — 31 @ 33.9
- `alloy wheel manufacturing plant cost` — 13 @ 28.8
- `aluminum alloy wheel manufacturing plant cost` — 12 @ 28.4

These are buyers scoping a project. Nothing on the site addresses what drives the cost of
setting such a plant up. **This cannot be written without real project input** — publishing
invented figures to a buyer researching capex would be worse than ranking nowhere.

## Ranking for the wrong intent

Five variants of `aluminum gdc machined components / parts / spares for automotive industry`
hold **positions 1.1 to 1.7 across ~149 impressions and produce zero clicks**. Those
searchers want machined components to buy. DNR sells the machines that make them. Ranking
first for a query the site cannot satisfy is not an opportunity, and chasing it would pull
the page away from its actual buyers.

## Noise in the data

A visible share of impressions are image-search and Lens queries rather than buyers:
`tendras fotos`, `show me a picture`, `show pictures`, `pics`, `cnc image`, `bilder?`,
`contoh video`, `can you show me video`, plus two entries that are somebody's AI prompt
pasted into search. Several `position 1.0, zero clicks` rows are almost certainly image
results. Discount these when reading the averages.

## What to do next, in order

1. **Measure the metadata change.** The curated titles and descriptions for all 18 products
   and 7 services shipped today. Compare the next 28 days against this baseline before
   changing anything else. The three big pages above are the test.
2. **Write the squeeze casting cluster.** Largest unserved demand where the site already
   ranks within reach.
3. **Answer `gdc machine full form` and `what is GDC`** — 18 impressions at position 1.8,
   purely informational, and the kind of direct-answer content AI surfaces cite.
4. **Deepen the pages already cited in AI answers** rather than writing new ones for them.
5. **Leave the plant-cost queries alone until real project data exists.**
6. **Ignore the automotive-components queries.** Wrong intent.
