import Link from 'next/link';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ClientLogosSection } from '@/components/ClientLogosSection';
import { Coverage } from '@/components/Coverage';
import { FeaturedMachinesSection } from '@/components/FeaturedMachinesSection';
import { FloatingSupport } from '@/components/FloatingSupport';
import { Footer } from '@/components/Footer';
import { HeroSlider } from '@/components/HeroSlider';
import { InquiryForm } from '@/components/InquiryForm';
import { Nav } from '@/components/Nav';
import { ServiceGrid } from '@/components/ServiceGrid';
import { Testimonials } from '@/components/Testimonials';
import { TrustSection } from '@/components/TrustSection';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { products, categories, testimonials, homepage, settings, services, clientLogos, featuredMachines } = await fetchPublicData();

  const companyName = settings?.companyName || 'DNR Techno Services';
  const logo = settings?.logo || '/logo-dnr.png';
  const primaryPhone = settings?.primaryPhone || settings?.phone?.[0] || '';
  const secondaryPhone = settings?.secondaryPhone || settings?.phone?.[1] || '';
  const whatsappNumber = settings?.whatsappNumber || primaryPhone;
  const email = settings?.email || '';
  const contactNumbers = [primaryPhone, secondaryPhone].filter(Boolean);
  const quickLinks = (settings?.contactQuickLinks || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const primaryHeroHref = categories.length > 0 ? '#categories' : '#contact';
  const hero = homepage?.hero || {
    heading: companyName,
    subheading: 'Industrial machinery, service support, and engineering guidance managed directly from the DNR CMS.',
    ctaPrimary: 'Explore categories',
    ctaSecondary: settings?.headerCtaLabel || 'Talk to an Expert',
    tagline: companyName,
  };
  const about = homepage?.about || { heading: '', body: '', bullets: [] };
  const sections = homepage?.sections || {};
  const heroStats = (homepage?.heroStats || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const whyCards = (homepage?.why || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const industries = ((homepage?.industries as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const trustCards = ((homepage?.trustCards as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const coverageEntries = ((homepage?.coverageStates as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const coverageStateDescriptions = Object.fromEntries(coverageEntries.map((item: any) => [item.stateId, item.description]));
  const coverageStates = coverageEntries.map((item: any) => item.stateId);

  return (
    <div className="bg-background text-secondary">
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={settings?.headerCtaTarget || '#contact'}
      />
      <main className="container-wide space-y-16 pb-20 pt-14">
        {(sections.hero?.visible ?? true) && (
          <section id="hero" className="grid items-center gap-10 rounded-3xl border border-secondary/10 bg-gradient-to-br from-white via-muted to-white p-8 shadow-lg shadow-secondary/10 md:grid-cols-[1.05fr,0.95fr] md:p-12">
            <div className="space-y-6">
              <span className="pill mb-2 inline-flex">{hero.tagline}</span>
              <h1 className="text-4xl font-semibold leading-tight text-secondary md:text-6xl">{hero.heading}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-secondary/80">{hero.subheading}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={primaryHeroHref} className="btn-primary shadow-md">
                  {hero.ctaPrimary || (categories.length > 0 ? 'Explore categories' : 'Talk to an Expert')}
                </Link>
                <Link href={settings?.headerCtaTarget || '#contact'} className="btn-ghost border-secondary/20 bg-white text-secondary shadow-sm">
                  {hero.ctaSecondary || settings?.headerCtaLabel || 'Contact us'}
                </Link>
              </div>
              {heroStats.length ? (
                <div className={`grid gap-4 text-sm text-secondary/80 ${heroStats.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {heroStats.map((stat: any) => (
                    <div key={`${stat.label}-${stat.value}`} className="rounded-xl border border-secondary/10 bg-white px-4 py-3 shadow-sm">
                      <p className="text-3xl font-semibold text-secondary">{stat.value}</p>
                      <p>{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <HeroSlider />
          </section>
        )}

        {(about.heading || about.body || about.bullets.length) ? (
          <section id="about" className="glass grid gap-8 rounded-3xl border border-secondary/10 bg-white/95 p-10 shadow-lg shadow-secondary/10 md:grid-cols-[1fr,1.1fr]">
            <div className="space-y-3">
              <p className="pill inline-flex">About</p>
              {about.heading ? <h3 className="text-3xl font-semibold text-secondary">{about.heading}</h3> : null}
              {about.body ? <p className="text-secondary/80">{about.body}</p> : null}
            </div>
            {about.bullets.length ? (
              <div className="grid gap-4 text-secondary/90 sm:grid-cols-2">
                {about.bullets.map((bullet: string) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-secondary/10 bg-white p-4 text-base shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <span className="mt-1.5 h-3 w-3 rounded-full bg-primary" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {(sections.categories?.visible ?? true) && categories.length > 0 && (
          <CategoryGrid
            categories={categories || []}
            products={products || []}
            title={sections.categories?.title || 'Product Categories'}
            kicker={sections.categories?.kicker || 'Precision machinery across casting, machining, marking, polishing, testing.'}
            viewAllLabel={sections.categories?.buttonLabel || 'View all →'}
          />
        )}

        {(sections.services?.visible ?? true) && services.length > 0 && (
          <ServiceGrid
            id="services"
            services={services || []}
            title={sections.services?.title || 'Services that keep plants online'}
            kicker={sections.services?.kicker || 'Installation, commissioning, audits, diagnostics, and reliability programs for casting, machining, marking, and testing lines.'}
          />
        )}

        {(sections.whyChoose?.visible ?? true) && whyCards.length > 0 && (
          <section id="why" className="glass rounded-3xl border border-accent/30 bg-white/90 p-10">
            <p className="pill inline-flex">Why choose DNR</p>
            <h3 className="mt-4 text-3xl font-semibold text-secondary">{sections.whyChoose?.title || 'Why teams choose DNR'}</h3>
            {sections.whyChoose?.kicker && <p className="mt-2 max-w-3xl text-secondary/75">{sections.whyChoose.kicker}</p>}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {whyCards.map((item: any) => (
                <div key={item.title} className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-secondary">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-secondary/75">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(sections.coverage?.visible ?? true) && coverageEntries.length > 0 && (
          <Coverage
            states={coverageStates}
            title={sections.coverage?.title || 'Pan-India coverage'}
            kicker={sections.coverage?.kicker || 'Coverage across key manufacturing belts, with install, service, and partner support where DNR customers operate.'}
            summaryTitle={sections.coverage?.summaryTitle || 'Coverage network'}
            summaryText={sections.coverage?.summaryText || 'DNR supports installs, service calls, and partner-led response where customers run foundry, machining, automation, and industrial engineering operations.'}
            stateDescriptions={coverageStateDescriptions}
          />
        )}

        {(sections.industries?.visible ?? true) && industries.length > 0 && (
          <section id="industries" className="container-wide space-y-6">
            <div>
              <p className="pill inline-flex">Industries & applications</p>
              <h3 className="mt-3 text-3xl font-semibold text-secondary">{sections.industries?.title || 'Where DNR machinery runs'}</h3>
              <p className="mt-1 text-secondary/75">{sections.industries?.kicker || 'Capability across casting cells, machining lines, automation, and finishing.'}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {industries.map((industry: any) => (
                <div key={industry.title} className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-md shadow-secondary/10 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 font-semibold text-secondary">
                      {industry.title.slice(0, 2).toUpperCase()}
                    </span>
                    <h4 className="text-lg font-semibold text-secondary">{industry.title}</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-secondary/80">{industry.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(sections.testimonials?.visible ?? true) && testimonials.length > 0 && (
          <section id="testimonials">
            <Testimonials
              testimonials={testimonials}
              title={sections.testimonials?.title || 'Trusted by plant heads and maintenance leaders'}
              kicker={sections.testimonials?.kicker || 'High-uptime plants choose DNR for reliable installs, responsive service, and clear communication.'}
            />
          </section>
        )}

        {(sections.trust?.visible ?? true) && trustCards.length > 0 && (
          <TrustSection
            title={sections.trust?.title || 'Trusted across manufacturing'}
            kicker={sections.trust?.kicker || 'Operational proof instead of placeholders.'}
            cards={trustCards.map((card: any) => ({ title: card.title, desc: card.description }))}
          />
        )}

        {(sections.clients?.visible ?? true) && clientLogos.length > 0 && (
          <ClientLogosSection
            title={sections.clients?.title || 'Associated Brands'}
            kicker={sections.clients?.kicker || 'Customer and brand relationships from DNR project materials.'}
            logos={clientLogos || []}
          />
        )}

        {(sections.featuredMachines?.visible ?? true) && featuredMachines.length > 0 && (
          <FeaturedMachinesSection
            title={sections.featuredMachines?.title || 'Featured Machine'}
            kicker={sections.featuredMachines?.kicker || 'Highlighted production-ready machinery from the latest DNR materials.'}
            machines={featuredMachines || []}
          />
        )}

        {(sections.inquiry?.visible ?? true) && (
          <section id="contact" className="glass grid gap-8 rounded-3xl border border-accent/30 bg-white/90 p-10 scroll-mt-28 md:grid-cols-2">
            <div className="space-y-4">
              <p className="pill inline-flex">{sections.inquiry?.kicker || 'Inquiry'}</p>
              <h3 className="text-3xl font-semibold text-secondary">{settings?.inquiryForm?.heading || sections.inquiry?.title || 'Talk to an expert'}</h3>
              <p className="text-secondary/80">
                {settings?.inquiryForm?.description ||
                  settings?.inquiryIntro ||
                  'Share your requirement for casting, machining, marking, polishing, or testing equipment. We’ll recommend the right machine, commissioning plan, and service model.'}
              </p>
              <div className="space-y-2 text-lg text-secondary/80">
                <p className="font-semibold text-secondary">Quick contact</p>
                <div className="flex flex-col gap-1">
                  {quickLinks.length ? (
                    quickLinks.map((item: any) => (
                      <a
                        key={`${item.label}-${item.value}`}
                        className="font-semibold text-primary hover:underline"
                        href={
                          item.href ||
                          (item.type === 'phone'
                            ? `tel:${item.value}`
                            : item.type === 'email'
                              ? `mailto:${item.value}`
                              : item.type === 'whatsapp'
                                ? `https://wa.me/${String(item.value || '').replace(/[^0-9]/g, '')}`
                                : item.value)
                        }
                        target={item.type === 'whatsapp' || String(item.href || '').startsWith('http') ? '_blank' : undefined}
                        rel={item.type === 'whatsapp' || String(item.href || '').startsWith('http') ? 'noreferrer' : undefined}
                      >
                        {item.label}
                      </a>
                    ))
                  ) : (
                    <>
                      {primaryPhone && <a className="font-semibold text-primary hover:underline" href={`tel:${primaryPhone}`}>Call: {primaryPhone}</a>}
                      {email && <a className="font-semibold text-primary hover:underline" href={`mailto:${email}`}>Email: {email}</a>}
                      {whatsappNumber && <a className="font-semibold text-primary hover:underline" href={`https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">WhatsApp: {whatsappNumber}</a>}
                    </>
                  )}
                </div>
              </div>
            </div>
            <InquiryForm config={settings?.inquiryForm} />
          </section>
        )}
      </main>
      <Footer
        companyName={companyName}
        footerDescription={settings?.footerDescription}
        phoneNumbers={contactNumbers}
        email={email}
        address={settings?.address}
        website={settings?.website}
        footerLinks={settings?.footerLinks}
      />
      <FloatingSupport whatsappNumber={whatsappNumber} label={settings?.floatingSupportLabel || 'WhatsApp Support'} />
    </div>
  );
}
