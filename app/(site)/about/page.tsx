import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';
import { absoluteUrl, buildBreadcrumbJsonLd, buildWebPageJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { homepage } = await fetchPublicData();
  const about = (homepage as any)?.about || {};
  return createPageMetadata({
    title: 'About DNR Techno Services | Industrial Machinery Supply & Support',
    description:
      about.body ||
      'Learn how DNR Techno Services supports manufacturers with industrial machinery supply, service coordination, installation guidance, and plant-focused engineering support across India.',
    path: '/about',
    keywords: [
      'about dnr techno services',
      'industrial machinery company india',
      'machine supply and support',
      'plant engineering support',
      'industrial machinery partner',
    ],
  });
}

export default async function AboutPage() {
  const { homepage, settings, products = [] } = await fetchPublicData();
  const about = (homepage as any)?.about || { heading: '', body: '', bullets: [] };
  const siteSettings: any = settings || {};

  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const email = siteSettings.email || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const structuredData = [
    buildWebPageJsonLd({
      name: about.heading || 'About DNR Techno Services',
      description: about.body || 'Industrial machinery, service support, and engineering coordination for manufacturing teams across India.',
      path: '/about',
      image: siteSettings.logo || '/logo-dnr.png',
    }),
    buildBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'About', url: absoluteUrl('/about') },
    ]),
  ];

  return (
    <div className="min-h-screen bg-[#071014] text-white">
      <StructuredData data={structuredData} />
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Get in Touch'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
        theme="dark"
      />
      <main className="container-wide max-w-5xl space-y-8 pb-16 pt-12 md:pb-20 md:pt-14">
        <div className="space-y-3 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_20px_48px_rgba(0,0,0,0.26)] md:p-8">
          <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">About</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">{about.heading || 'Engineer-backed machinery support for modern manufacturing teams'}</h1>
          {about.body ? (
            <p className="max-w-3xl text-lg leading-relaxed text-slate-300">{about.body}</p>
          ) : (
            <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
              DNR Techno Services works with foundries, machining businesses, faucet manufacturers, and industrial production teams that need dependable machinery supply, clearer technical guidance, and practical follow-up after the order stage.
            </p>
          )}
        </div>

        {about.bullets?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {about.bullets.map((bullet: string) => (
              <div key={bullet} className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-3 w-3 rounded-full bg-[#7ed321]" />
                  <p className="text-base leading-relaxed text-slate-300">{bullet}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-semibold text-white">What DNR helps manufacturers solve</h2>
            <div className="mt-3 space-y-3 text-slate-300">
              <p>
                Industrial buyers often need more than a machine brochure. They need help comparing machine options, understanding suitability for their parts, aligning plant layout needs, and planning for commissioning, service, and spare-parts continuity.
              </p>
              <p>
                DNR Techno Services focuses on that practical gap between machine selection and real production execution. That includes support for die casting machinery, foundry systems, CNC equipment, automation-ready machines, and production-side coordination that helps teams move with more confidence.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <Link href="/products" className="rounded-full border border-[#7ed321]/20 bg-[#7ed321]/10 px-4 py-2 font-semibold text-[#d5f4a8] transition hover:border-[#7ed321]/35 hover:bg-[#7ed321]/14">Explore products</Link>
              <Link href="/services" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-semibold text-white transition hover:border-[#7ed321]/30 hover:text-[#d5f4a8]">View services</Link>
            </div>
          </div>
          <div id="contact" className="rounded-3xl border border-[#7ed321]/16 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-8 text-white shadow-[0_18px_40px_rgba(0,0,0,0.26)] scroll-mt-28">
            <h2 className="text-2xl font-semibold">Talk to DNR</h2>
            <div className="mt-4 space-y-2 text-slate-300">
              {primaryPhone && <a href={`tel:${primaryPhone}`} className="block font-semibold text-[#d5f4a8] hover:underline">{primaryPhone}</a>}
              {secondaryPhone && <a href={`tel:${secondaryPhone}`} className="block font-semibold text-[#d5f4a8] hover:underline">{secondaryPhone}</a>}
              <a href={`mailto:${email}`} className="block font-semibold text-[#d5f4a8] hover:underline">
                {email}
              </a>
              {siteSettings.address && <p>{siteSettings.address}</p>}
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)] md:p-8">
          <h2 className="text-2xl font-semibold text-white">Why this matters for production teams</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              'Reduce friction during machine shortlisting with clearer technical conversations.',
              'Support plant teams with practical coordination around commissioning, uptime, and spare parts.',
              'Keep commercial and technical decision-making closer to actual production requirements.',
            ].map((point) => (
              <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                {point}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer
        theme="dark"
        companyName={companyName}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
    </div>
  );
}
