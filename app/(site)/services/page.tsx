import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ServiceGrid } from '@/components/ServiceGrid';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchPublicData } from '@/lib/data';
import { absoluteUrl, buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { homepage } = await fetchPublicData();
  const section = (homepage as any)?.sections?.services || {};
  return createPageMetadata({
    title: 'Services',
    description: section.kicker || 'Explore DNR Techno Services support capabilities for installation, diagnostics, commissioning, and plant-side engineering.',
    path: '/services',
  });
}

export default async function ServicesPage() {
  const [{ services, homepage, settings }, products] = await Promise.all([fetchPublicData(), fetchLiveProducts()]);
  const siteSettings: any = settings || {};
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const section = (homepage as any)?.sections?.services || {};
  const structuredData = buildBreadcrumbJsonLd([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Services', url: absoluteUrl('/services') },
  ]);

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
      <main className="container-wide space-y-8 pb-16 pt-12 md:pb-20 md:pt-14">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:p-8">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Services</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{section.title || 'Services'}</h1>
            <p className="max-w-3xl text-slate-300">
              {section.kicker || 'Services added from the admin panel will appear here.'}
            </p>
          </div>
        </div>
        {services.length ? (
          <ServiceGrid
            services={services}
            id="services"
            title={section.title || 'Services'}
            kicker={section.kicker || 'Services added from the admin panel will appear here.'}
            theme="dark"
          />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#111b24] p-8 text-slate-300 shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
            No services have been added yet.
          </div>
        )}
      </main>
      <Footer
        theme="dark"
        companyName={companyName}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={siteSettings.email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
    </div>
  );
}
