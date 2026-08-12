import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ServiceGrid } from '@/components/ServiceGrid';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';
import { absoluteUrl, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd, buildWebPageJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { homepage, services = [] } = await fetchPublicData();
  const section = (homepage as any)?.sections?.services || {};
  return createPageMetadata({
    title: 'Industrial Machinery Services, Maintenance & Plant Support',
    description:
      section.kicker ||
      'Explore DNR Techno Services support capabilities for installation, commissioning, breakdown maintenance, AMC support, spare-parts continuity, and plant-side engineering.',
    path: '/services',
    keywords: [
      'industrial machinery services',
      'machine installation services',
      'breakdown maintenance',
      'annual maintenance contract',
      'spare parts support',
      'plant engineering support',
    ],
    image: services?.[0]?.image || services?.[0]?.imageUrl || services?.[0]?.coverImage,
  });
}

export default async function ServicesPage() {
  const { services = [], homepage, settings, products = [] } = await fetchPublicData();
  const siteSettings: any = settings || {};
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const section = (homepage as any)?.sections?.services || {};
  const structuredData = [
    buildBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Services', url: absoluteUrl('/services') },
    ]),
    buildCollectionPageJsonLd({
      name: 'Industrial Services & Plant Support',
      description: 'Installation, commissioning, maintenance, spare parts support, and plant-side industrial service coordination from DNR Techno Services.',
      path: '/services',
      image: services?.[0]?.image || services?.[0]?.imageUrl || services?.[0]?.coverImage,
    }),
    buildWebPageJsonLd({
      name: 'Industrial Services & Plant Support',
      description: section.kicker || 'Plant-side support services for industrial machinery users across India.',
      path: '/services',
      image: services?.[0]?.image || services?.[0]?.imageUrl || services?.[0]?.coverImage,
    }),
    buildItemListJsonLd({
      name: 'DNR Services',
      path: '/services',
      items: (services || []).slice(0, 24).map((service: any) => ({
        name: service.title,
        url: `/services/${service.slug}`,
      })),
    }),
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
      <main className="container-wide space-y-8 pb-16 pt-12 md:pb-20 md:pt-14">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:p-8">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Services</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{section.title || 'Industrial services for machinery uptime and production continuity'}</h1>
            <p className="max-w-3xl text-slate-300">
              {section.kicker || 'DNR Techno Services supports industrial buyers and plant teams with installation planning, machine selection consultation, breakdown maintenance, AMC coordination, spare-parts support, and turnkey project assistance.'}
            </p>
          </div>
        </div>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Installation & commissioning',
              description: 'Support around new machine installation, commissioning readiness, and production-line startup planning.',
            },
            {
              title: 'Maintenance & uptime',
              description: 'Breakdown response, periodic maintenance, and AMC-style support focused on reducing production disruption.',
            },
            {
              title: 'Spare parts & execution',
              description: 'Fast spare-parts coordination and practical plant-side follow-up for machinery already in operation.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.92),rgba(10,16,20,0.98))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </section>
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
