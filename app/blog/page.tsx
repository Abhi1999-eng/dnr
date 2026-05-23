import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { ManagedImage } from '@/components/ManagedImage';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchPublicData, fetchPublishedBlogs } from '@/lib/data';
import { resolveMediaUrl } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: 'Industrial Insights & Machinery Guides',
    description: 'Read practical machinery guides, maintenance insights, and plant-side engineering articles from DNR Techno Services.',
    path: '/blog',
  });
}

function formatDate(value?: string) {
  if (!value) return 'Recently updated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default async function BlogPage() {
  const [{ settings }, products, blogs] = await Promise.all([fetchPublicData(), fetchLiveProducts(), fetchPublishedBlogs()]);
  const siteSettings: any = settings || {};
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const structuredData = buildBreadcrumbJsonLd([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Blog', url: absoluteUrl('/blog') },
  ]);

  return (
    <div className="min-h-screen bg-[#071014] text-white">
      <StructuredData data={structuredData} />
      <Nav
        companyName={companyName}
        logo={siteSettings.logo || '/logo-dnr.png'}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Get in Touch'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
        theme="dark"
      />
      <main className="container-wide space-y-8 py-12 md:py-14">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.96),rgba(10,16,20,0.98))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.3)] md:p-8">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Blog</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Industrial Insights &amp; Machinery Guides</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
              Practical articles from DNR Techno Services covering machine selection, uptime support, installation planning, maintenance coordination, and plant-ready execution.
            </p>
          </div>
        </section>

        {blogs.length ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog: any) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] shadow-[0_20px_44px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-[#7ed321]/35 hover:shadow-[0_24px_50px_rgba(0,0,0,0.32)]"
              >
                <div className="relative h-[220px] overflow-hidden border-b border-white/8 bg-[#0b1218]">
                  <ManagedImage
                    src={resolveMediaUrl(blog.featuredImage, '/dnr/page_06.png')}
                    alt={blog.featuredImageAlt || blog.title}
                    fill
                    className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {blog.category ? <span className="rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-2.5 py-1 text-[#d5f4a8]">{blog.category}</span> : null}
                    <span className="text-slate-400">{formatDate(blog.publishedAt || blog.createdAt)}</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">{blog.title}</h2>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-300">{blog.excerpt || 'Read the full article for machine support guidance and practical execution details.'}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-400">By {blog.authorName || 'DNR Techno Services'}</span>
                    <span className="font-semibold text-[#7ed321] transition group-hover:translate-x-1">Read more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/12 bg-[#111b24] px-6 py-14 text-center shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-semibold text-white">No blog posts published yet</h2>
            <p className="mt-2 text-sm text-slate-400">Draft or publish your first article from the admin panel to see it here.</p>
          </div>
        )}
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
