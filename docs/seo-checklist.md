# DNR SEO and Google AI Readiness Checklist

This checklist is for local QA and post-deploy verification of the DNR Techno Services website.

## Search Console setup
- Verify the production property for [https://dnrtechnoservices.com](https://dnrtechnoservices.com) in Google Search Console.
- Verify the domain property if DNS verification is available.
- Confirm that the preferred canonical domain matches the production domain.

## Submit sitemap
- Submit [https://dnrtechnoservices.com/sitemap.xml](https://dnrtechnoservices.com/sitemap.xml) in Search Console.
- Re-submit the sitemap after major content launches such as new product groups, service pages, or blog launches.

## URL inspection priorities
Inspect these page types in Search Console after deployment:
- Homepage
- `/products`
- at least one high-value product detail page
- `/services`
- at least one service detail page
- `/blog`
- at least one published blog article

Check that:
- the page is indexed
- the selected canonical is correct
- the live URL is crawlable
- screenshots show the real public page content

## Structured data validation
Validate representative pages using:
- Google Rich Results Test
- Schema.org validator

Check these page types:
- homepage: Organization, WebSite, WebPage
- product detail page: WebPage, Service, BreadcrumbList
- service detail page: WebPage, Service, BreadcrumbList
- blog detail page: Article, BreadcrumbList

Important:
- Do not add fake price, stock, shipping, rating, or review data.
- DNR is an inquiry-based B2B site, not an ecommerce checkout site.

## Core Web Vitals and speed
Run PageSpeed Insights or Lighthouse on:
- homepage
- one product page
- one service page
- one blog page

Review:
- LCP
- CLS
- INP
- image sizing
- render-blocking scripts
- unused JavaScript

## Crawlability and indexing
- Confirm `/robots.txt` is reachable.
- Confirm `/admin` remains blocked in robots.
- Confirm draft blogs are not exposed in the sitemap.
- Confirm internal links use crawlable anchor links or Next `Link` components.

## Metadata review
Verify that each page type has:
- unique title
- useful meta description
- canonical URL
- Open Graph image where available
- sensible social preview copy

## AI visibility notes
Google AI visibility depends on pages being:
- indexed
- technically crawlable
- snippet-eligible
- clear and useful to real searchers

For DNR specifically:
- Write content for real manufacturing buyers, plant teams, and technical decision makers.
- Be specific about machinery use cases, support scope, and plant-side outcomes.
- Avoid fake schema, fake certifications, fake reviews, or fake business claims.
- Publish useful blogs, machine guides, and FAQs regularly.
- Keep product and service pages internally linked so Google can understand topical relationships.

## Ongoing content recommendations
- Add high-quality FAQs to major product and service pages.
- Publish machinery comparison guides and maintenance support blogs.
- Link blogs to relevant products and services.
- Refresh outdated product descriptions and images.
- Monitor Search Console queries and impressions for new content opportunities.
