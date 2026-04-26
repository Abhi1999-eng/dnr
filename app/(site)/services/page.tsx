import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ServiceGrid } from '@/components/ServiceGrid';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';
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
  const { services, homepage, settings, products } = await fetchPublicData();
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
    <div className="min-h-screen bg-background text-secondary">
      <StructuredData data={structuredData} />
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
      />
      <main className="container-wide space-y-10 pb-20 pt-16">
        <div className="space-y-2">
          <p className="pill inline-flex">Services</p>
          <h1 className="text-4xl font-semibold text-secondary">{section.title || 'Services'}</h1>
          <p className="max-w-3xl text-secondary/80">
            {section.kicker || 'Services added from the admin panel will appear here.'}
          </p>
        </div>
        {services.length ? (
          <ServiceGrid
            services={services}
            id="services"
            title={section.title || 'Services'}
            kicker={section.kicker || 'Services added from the admin panel will appear here.'}
          />
        ) : (
          <div className="rounded-3xl border border-secondary/10 bg-white p-8 text-secondary/75 shadow-lg shadow-secondary/10">
            No services have been added yet.
          </div>
        )}
      </main>
      <Footer
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
