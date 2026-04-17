import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const { homepage, settings } = await fetchPublicData();
  const about = homepage?.about || { heading: '', body: '', bullets: [] };

  const companyName = settings?.companyName || 'DNR Techno Services';
  const logo = settings?.logo || '/logo-dnr.png';
  const primaryPhone = settings?.primaryPhone || settings?.phone?.[0] || '';
  const secondaryPhone = settings?.secondaryPhone || settings?.phone?.[1] || '';
  const email = settings?.email || '';
  const headerCtaHref = resolveContactActionHref(settings?.headerCtaActionType, settings?.headerCtaValue || settings?.headerCtaTarget, '#contact');

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
      />
      <main className="container-wide max-w-5xl space-y-10 pb-20 pt-16">
        <div className="space-y-3">
          <p className="pill inline-flex">About</p>
          <h1 className="text-4xl font-semibold text-secondary md:text-5xl">{about.heading || companyName}</h1>
          {about.body ? <p className="max-w-3xl text-lg leading-relaxed text-secondary/80">{about.body}</p> : <p className="max-w-3xl text-lg leading-relaxed text-secondary/80">Company profile content can be managed from the admin panel.</p>}
        </div>

        {about.bullets?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {about.bullets.map((bullet: string) => (
              <div key={bullet} className="rounded-2xl border border-secondary/10 bg-white p-6 shadow-lg shadow-secondary/10">
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-base leading-relaxed text-secondary/85">{bullet}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-secondary/10 bg-white p-8 shadow-lg shadow-secondary/10">
            <h2 className="text-2xl font-semibold text-secondary">What we solve</h2>
            <p className="mt-3 text-secondary/80">
              Add your company overview, support approach, and proof points from the admin panel when you are ready.
            </p>
          </div>
          <div id="contact" className="rounded-3xl border border-secondary/10 bg-secondary p-8 text-white shadow-lg shadow-secondary/20 scroll-mt-28">
            <h2 className="text-2xl font-semibold">Talk to DNR</h2>
            <div className="mt-4 space-y-2 text-white/80">
              {primaryPhone && <a href={`tel:${primaryPhone}`} className="block font-semibold text-primary-foreground hover:underline">{primaryPhone}</a>}
              {secondaryPhone && <a href={`tel:${secondaryPhone}`} className="block font-semibold text-primary-foreground hover:underline">{secondaryPhone}</a>}
              <a href={`mailto:${email}`} className="block font-semibold text-primary-foreground hover:underline">
                {email}
              </a>
              {settings?.address && <p>{settings.address}</p>}
            </div>
          </div>
        </div>
      </main>
      <Footer
        companyName={companyName}
        footerDescription={settings?.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={email}
        address={settings?.address}
        website={settings?.website}
        footerLinks={settings?.footerLinks}
      />
    </div>
  );
}
