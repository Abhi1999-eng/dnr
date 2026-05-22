import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchPublicData } from '@/lib/data';
import { absoluteUrl, buildBreadcrumbJsonLd, buildOrganizationJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { homepage } = await fetchPublicData();
  const about = (homepage as any)?.about || {};
  return createPageMetadata({
    title: 'About',
    description: about.body || 'Learn about DNR Techno Services and our industrial machinery, service support, and engineering approach.',
    path: '/about',
  });
}

export default async function AboutPage() {
  const [{ homepage, settings }, products] = await Promise.all([fetchPublicData(), fetchLiveProducts()]);
  const about = (homepage as any)?.about || { heading: '', body: '', bullets: [] };
  const siteSettings: any = settings || {};

  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const email = siteSettings.email || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const structuredData = [
    buildOrganizationJsonLd(siteSettings),
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
          <h1 className="text-4xl font-semibold text-white md:text-5xl">{about.heading || companyName}</h1>
          {about.body ? <p className="max-w-3xl text-lg leading-relaxed text-slate-300">{about.body}</p> : <p className="max-w-3xl text-lg leading-relaxed text-slate-300">Company profile content can be managed from the admin panel.</p>}
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
            <h2 className="text-2xl font-semibold text-white">What we solve</h2>
            <p className="mt-3 text-slate-300">
              Add your company overview, support approach, and proof points from the admin panel when you are ready.
            </p>
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
