import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogContent } from '@/components/BlogContent';
import { Footer } from '@/components/Footer';
import { ManagedImage } from '@/components/ManagedImage';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchBlogBySlug, fetchLatestBlogs, fetchLiveProducts, fetchProductsByIds, fetchPublicData } from '@/lib/data';
import { resolveProductImage, resolveMediaUrl } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, SITE_NAME, trimDescription } from '@/lib/seo';

export const revalidate = 300;

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog: any = await fetchBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog not found',
      description: 'The requested blog could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = blog.seoTitle || blog.title;
  const description = trimDescription(blog.seoDescription || blog.excerpt || blog.content);
  const canonical = blog.canonicalUrl || absoluteUrl(`/blog/${blog.slug}`);
  const image = resolveMediaUrl(blog.featuredImage, '/dnr/page_06.png');
  const resolvedImage = image.startsWith('http') ? image : absoluteUrl(image);
  const keywords = Array.isArray(blog.seoKeywords) ? blog.seoKeywords : [];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.updatedAt || blog.createdAt,
      images: [{ url: resolvedImage, width: 1200, height: 630, alt: blog.featuredImageAlt || blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [resolvedImage],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [blog, { settings }, products, latestBlogs] = await Promise.all([
    fetchBlogBySlug(slug),
    fetchPublicData(),
    fetchLiveProducts(),
    fetchLatestBlogs(slug, 4),
  ]);

  if (!blog) {
    notFound();
  }

  const blogData: any = blog;
  const siteSettings: any = settings || {};
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const relatedProducts = await fetchProductsByIds(Array.isArray(blogData.relatedProducts) ? blogData.relatedProducts.map((item: any) => String(item)) : []);
  const sidebarProducts = relatedProducts.length ? relatedProducts : (products || []).slice(0, 3);
  const articleUrl = blogData.canonicalUrl || absoluteUrl(`/blog/${blogData.slug}`);
  const articleImage = resolveMediaUrl(blogData.featuredImage, '/dnr/page_06.png');
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blogData.title,
    description: trimDescription(blogData.seoDescription || blogData.excerpt || blogData.content),
    image: [articleImage.startsWith('http') ? articleImage : absoluteUrl(articleImage)],
    author: {
      '@type': 'Organization',
      name: blogData.authorName || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/images/dnr-logo-white-transparent-clean.png'),
      },
    },
    datePublished: blogData.publishedAt || blogData.createdAt,
    dateModified: blogData.updatedAt || blogData.createdAt,
    mainEntityOfPage: articleUrl,
  };
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Blog', url: absoluteUrl('/blog') },
    { name: blogData.title, url: articleUrl.startsWith('http') ? articleUrl : absoluteUrl(`/blog/${blogData.slug}`) },
  ]);

  return (
    <div className="min-h-screen bg-[#071014] text-white">
      <StructuredData data={[breadcrumbData, articleStructuredData]} />
      <Nav
        companyName={companyName}
        logo={siteSettings.logo || '/logo-dnr.png'}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Get in Touch'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
        theme="dark"
      />
      <main className="container-wide space-y-8 py-12 md:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-[#d5f4a8]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="transition hover:text-[#d5f4a8]">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-200">{blogData.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:items-start">
          <article className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.96),rgba(10,16,20,0.98))] p-6 shadow-[0_24px_54px_rgba(0,0,0,0.3)] md:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                {blogData.category ? <span className="rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#d5f4a8]">{blogData.category}</span> : null}
                {blogData.publishedAt || blogData.createdAt ? <span>{formatDate(blogData.publishedAt || blogData.createdAt)}</span> : null}
                <span>By {blogData.authorName || 'DNR Techno Services'}</span>
              </div>
              <div className="space-y-3">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">{blogData.title}</h1>
                {blogData.excerpt ? <p className="max-w-3xl text-lg leading-8 text-slate-300">{blogData.excerpt}</p> : null}
              </div>
              {Array.isArray(blogData.tags) && blogData.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {blogData.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative h-[260px] overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1218] md:h-[360px] lg:h-[420px]">
              <ManagedImage
                src={articleImage}
                alt={blogData.featuredImageAlt || blogData.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>

            <BlogContent content={blogData.content} />
          </article>

          <aside className="space-y-5 lg:sticky lg:top-28">
            {sidebarProducts.length ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.96),rgba(10,16,20,0.98))] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.24)]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Related products</p>
                  <h2 className="text-xl font-semibold text-white">Machines connected to this topic</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {sidebarProducts.slice(0, 3).map((product: any) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#7ed321]/30 hover:bg-white/[0.05]"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#071014]">
                        <ManagedImage
                          src={resolveProductImage(product)}
                          alt={product.title}
                          fill
                          className="object-contain object-center p-2"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-white">{product.title}</p>
                        <p className="mt-1 text-xs text-[#7ed321]">View product →</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {latestBlogs.length ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.96),rgba(10,16,20,0.98))] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.24)]">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Latest blogs</p>
                  <h2 className="text-xl font-semibold text-white">Continue reading</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {latestBlogs.map((entry: any) => (
                    <Link key={entry.slug} href={`/blog/${entry.slug}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#7ed321]/30 hover:bg-white/[0.05]">
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{entry.excerpt || entry.content}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[28px] border border-[#7ed321]/18 bg-[linear-gradient(180deg,rgba(17,27,36,0.98),rgba(10,16,20,0.98))] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Get in touch</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Need help with machinery planning?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Talk to DNR about machine sourcing, installation support, maintenance coordination, or spare parts continuity.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={headerCtaHref} className="btn-primary">
                  Get in Touch
                </Link>
                <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white transition hover:border-[#7ed321]/35 hover:bg-[#7ed321]/8 hover:text-[#d5f4a8]">
                  Contact page
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <Footer
        theme="dark"
        companyName={companyName}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={[siteSettings.primaryPhone || siteSettings.phone?.[0], siteSettings.secondaryPhone || siteSettings.phone?.[1]].filter(Boolean)}
        email={siteSettings.email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
    </div>
  );
}
