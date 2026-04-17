import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ServiceGrid } from '@/components/ServiceGrid';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const { services, homepage, settings } = await fetchPublicData();
  const companyName = settings?.companyName || 'DNR Techno Services';
  const logo = settings?.logo || '/logo-dnr.png';
  const primaryPhone = settings?.primaryPhone || settings?.phone?.[0] || '';
  const secondaryPhone = settings?.secondaryPhone || settings?.phone?.[1] || '';
  const headerCtaHref = resolveContactActionHref(settings?.headerCtaActionType, settings?.headerCtaValue || settings?.headerCtaTarget, '#contact');
  const section = homepage?.sections?.services || {};

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
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
        footerDescription={settings?.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={settings?.email}
        address={settings?.address}
        website={settings?.website}
        footerLinks={settings?.footerLinks}
      />
    </div>
  );
}
