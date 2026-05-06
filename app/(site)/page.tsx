import Link from 'next/link';
import type { Metadata } from 'next';
import { ClientLogosSection } from '@/components/ClientLogosSection';
import { ContentCarousel } from '@/components/ContentCarousel';
import { Coverage } from '@/components/Coverage';
import { FloatingSupport } from '@/components/FloatingSupport';
import { InquirySection } from '@/components/InquirySection';
import { Footer } from '@/components/Footer';
import { HeroSlider } from '@/components/HeroSlider';
import { Nav } from '@/components/Nav';
import { ProductGrid } from '@/components/ProductGrid';
import { ServiceGrid } from '@/components/ServiceGrid';
import { StructuredData } from '@/components/StructuredData';
import { Testimonials } from '@/components/Testimonials';
import { TrustSection } from '@/components/TrustSection';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveClientLogos, fetchLiveProducts, fetchPublicData } from '@/lib/data';
import { resolveMediaUrl, resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildOrganizationJsonLd, buildWebsiteJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [{ settings, homepage }, products] = await Promise.all([fetchPublicData(), fetchLiveProducts()]);
  const homepageData: any = homepage || {};
  const siteSettings: any = settings || {};
  const title = siteSettings.seo?.title || 'Industrial Machinery and Engineering Support';
  const description =
    siteSettings.seo?.description ||
    homepageData?.hero?.subheading ||
    'DNR Techno Services supplies industrial machinery, commissioning, and plant support services for high-uptime manufacturing teams.';
  const image = resolveProductImage(products?.[0], resolveMediaUrl(siteSettings.seo?.ogImage || siteSettings.logo, '/logo-dnr.png'));

  return createPageMetadata({
    title,
    description,
    path: '/',
    image,
    keywords: ['industrial machinery India', 'DNR Techno Services', 'foundry machinery', 'CNC machine support', 'industrial engineering support'],
  });
}

export default async function HomePage() {
  const [{ testimonials, homepage, settings, services }, products, clientLogos] = await Promise.all([fetchPublicData(), fetchLiveProducts(), fetchLiveClientLogos()]);
  const homepageData: any = homepage || {};
  const siteSettings: any = settings || {};

  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const whatsappNumber = siteSettings.whatsappNumber || primaryPhone;
  const headerCtaHref = resolveContactActionHref(
    siteSettings.headerCtaActionType,
    siteSettings.headerCtaValue || siteSettings.headerCtaTarget || (siteSettings.headerCtaActionType === 'whatsapp' ? whatsappNumber : ''),
    '#contact'
  );
  const email = siteSettings.email || '';
  const contactNumbers = [primaryPhone, secondaryPhone].filter(Boolean);
  const quickLinks = (siteSettings.contactQuickLinks || [])
    .filter((item: any) => item.active !== false)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const sections = homepageData?.sections || {};
  const hero = homepageData?.hero || {};
  const heroHeading = hero.heading || 'Industrial machinery and engineering support for high-uptime plants';
  const heroSubheading =
    hero.subheading ||
    'DNR Techno Services delivers machinery, commissioning, and responsive support for casting, machining, automation, testing, and fabrication requirements.';
  const heroPrimaryCta = hero.ctaPrimary || 'View products';
  const heroSecondaryCta = hero.ctaSecondary || siteSettings.headerCtaLabel || 'Talk to an Expert';
  const heroTagline = hero.tagline || 'DNR Techno Services — Your service partner';
  const about = homepageData?.about || { heading: '', body: '', bullets: [] };
  const heroStats = (homepageData?.heroStats || [])
    .filter((item: any) => item.active !== false)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const whyCards = (homepageData?.why || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const industries = ((homepageData?.industries as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const trustCards = ((homepageData?.trustCards as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const coverageEntries = ((homepageData?.coverageStates as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const coverageStateDescriptions = Object.fromEntries(coverageEntries.map((item: any) => [item.stateId, item.description]));
  const coverageStateLabels = Object.fromEntries(coverageEntries.map((item: any) => [item.stateId, item.label]));
  const coverageStates = coverageEntries.map((item: any) => item.stateId);
  const productsSection = sections.products || {};
  const heroImage = resolveProductImage(products?.[0], resolveMediaUrl(siteSettings.seo?.ogImage || siteSettings.logo, '/logo-dnr.png'));
  const structuredData = [
    buildOrganizationJsonLd(siteSettings),
    buildWebsiteJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: heroHeading,
      description: heroSubheading,
      url: absoluteUrl('/'),
      primaryImageOfPage: heroImage.startsWith('http') ? heroImage : absoluteUrl(heroImage),
    },
  ];

  return (
    <div className="bg-background text-secondary">
      <StructuredData data={structuredData} />
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
      />
      <main className="container-wide space-y-12 pb-14 pt-6 md:pt-8">
        {(sections.hero?.visible ?? true) && (
          <section
            id="hero"
            className="relative overflow-hidden rounded-[30px] border border-secondary/10 bg-[linear-gradient(135deg,#ffffff,rgba(245,247,250,0.96),rgba(230,244,214,0.82))] py-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)] md:py-8 lg:py-10"
          >
            <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 md:px-8 lg:max-h-[550px] lg:grid-cols-[minmax(0,0.98fr)_minmax(390px,1.02fr)] lg:gap-8 lg:px-8">
            <div className="absolute -left-16 top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
            <div className="space-y-3.5">
              <div className="space-y-2">
                <span className="pill inline-flex">{heroTagline}</span>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-secondary md:text-5xl lg:text-[52px]">{heroHeading}</h1>
                  <p className="max-w-xl text-sm leading-6 text-secondary/80 md:text-base lg:text-lg">{heroSubheading}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link href="#products" className="btn-primary shadow-md">
                  {heroPrimaryCta}
                </Link>
                <Link href={headerCtaHref} className="btn-ghost border-secondary/15 bg-white text-secondary shadow-sm">
                  {heroSecondaryCta}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-secondary/75 md:text-sm">
                <span className="rounded-full border border-secondary/10 bg-white/80 px-3.5 py-1.5 shadow-sm">Industrial machinery support</span>
                <span className="rounded-full border border-secondary/10 bg-white/80 px-3.5 py-1.5 shadow-sm">Installation and commissioning</span>
                <span className="rounded-full border border-secondary/10 bg-white/80 px-3.5 py-1.5 shadow-sm">Responsive service coordination</span>
              </div>

              {heroStats.length ? (
                <div className={`grid gap-4 ${heroStats.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  {heroStats.map((stat: any) => (
                    <div key={`${stat.label}-${stat.value}`} className="rounded-2xl border border-secondary/10 bg-white/90 px-3.5 py-3 shadow-sm">
                      <p className="text-[1.5rem] font-semibold text-secondary">{stat.value}</p>
                      <p className="mt-1 text-sm text-secondary/75">{stat.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-2.5 md:grid-cols-3">
                  <div className="rounded-2xl border border-secondary/10 bg-white/90 px-3.5 py-3 shadow-sm">
                    <p className="text-[1.5rem] font-semibold text-secondary">All</p>
                    <p className="mt-1 text-sm text-secondary/75">Products added in admin appear automatically</p>
                  </div>
                  <div className="rounded-2xl border border-secondary/10 bg-white/90 px-3.5 py-3 shadow-sm">
                    <p className="text-[1.5rem] font-semibold text-secondary">Pan-India</p>
                    <p className="mt-1 text-sm text-secondary/75">Support aligned to key manufacturing hubs</p>
                  </div>
                  <div className="rounded-2xl border border-secondary/10 bg-white/90 px-3.5 py-3 shadow-sm">
                    <p className="text-[1.5rem] font-semibold text-secondary">Fast</p>
                    <p className="mt-1 text-sm text-secondary/75">Talk to an expert for machine guidance and service planning</p>
                  </div>
                </div>
              )}
            </div>
            <HeroSlider products={products || []} />
            </div>
          </section>
        )}

        {about.heading || about.body || about.bullets.length ? (
          <section id="about" className="glass grid gap-6 rounded-[24px] border border-secondary/10 bg-white/95 p-7 shadow-md shadow-secondary/10 md:grid-cols-[1fr,1.1fr]">
            <div className="space-y-3">
              <p className="pill inline-flex">About</p>
              {about.heading ? <h2 className="text-[1.5rem] font-semibold text-secondary">{about.heading}</h2> : null}
              {about.body ? <p className="text-secondary/80">{about.body}</p> : null}
            </div>
            {about.bullets.length ? (
              <div className="grid gap-3 text-secondary/90 sm:grid-cols-2">
                {about.bullets.map((bullet: string) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-secondary/10 bg-white p-3.5 text-sm md:text-[0.95rem] shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <span className="mt-1.5 h-3 w-3 rounded-full bg-primary" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {(productsSection.visible ?? true) && (
          <ProductGrid
            id="products"
            products={products || []}
            quickLinks={quickLinks}
            fallbackPhone={primaryPhone || '+919711196735'}
            fallbackWhatsapp={whatsappNumber || '+919711196735'}
            fallbackEmail={email || 'dnr.techservices@gmail.com'}
            enableModal
            title={productsSection.title || 'Products'}
            kicker={productsSection.kicker || 'Explore the machinery, systems, and solutions DNR supports for production-driven industrial environments.'}
            emptyTitle="No products added yet"
            emptyDescription="Add products from the admin panel and they will automatically appear on the homepage and products page."
          />
        )}

        {(sections.services?.visible ?? true) && services.length > 0 && (
          <ServiceGrid
            id="services"
            services={services || []}
            title={sections.services?.title || 'Services that keep plants online'}
            kicker={sections.services?.kicker || 'Installation, commissioning, audits, diagnostics, and reliability programs for casting, machining, marking, testing, and fabrication lines.'}
          />
        )}

        {(sections.whyChoose?.visible ?? true) && whyCards.length > 0 && (
          <section id="why" className="glass rounded-[24px] border border-accent/30 bg-white/90 p-7">
            <p className="pill inline-flex">Why choose DNR</p>
            <h2 className="mt-4 text-[1.7rem] font-semibold text-secondary">{sections.whyChoose?.title || 'Why teams choose DNR'}</h2>
            {sections.whyChoose?.kicker ? <p className="mt-2 max-w-3xl text-secondary/75">{sections.whyChoose.kicker}</p> : null}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {whyCards.map((item: any) => (
                <div key={item.title} className="rounded-2xl border border-secondary/10 bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-secondary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary/75">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <Coverage
          states={coverageStates}
          title={sections.coverage?.title || 'Pan-India coverage'}
          kicker={sections.coverage?.kicker || 'Coverage across key manufacturing belts, with install, service, and partner support where DNR customers operate.'}
          summaryTitle={sections.coverage?.summaryTitle || 'Coverage network'}
          summaryText={sections.coverage?.summaryText || 'DNR supports installs, service calls, and partner-led response where customers run foundry, machining, automation, and industrial engineering operations.'}
          stateDescriptions={coverageStateDescriptions}
          stateLabels={coverageStateLabels}
        />

        {(sections.industries?.visible ?? true) && industries.length > 0 && (
          <section id="industries" className="container-wide space-y-5">
            <div>
              <p className="pill inline-flex">Industries & applications</p>
              <h3 className="mt-3 text-[1.7rem] font-semibold text-secondary">{sections.industries?.title || 'Where DNR machinery runs'}</h3>
              <p className="mt-1 text-secondary/75">{sections.industries?.kicker || 'Capability across casting cells, machining lines, automation, and finishing.'}</p>
            </div>
            <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}>
              {industries.map((industry: any) => (
                <div key={industry.title} className="h-full rounded-[24px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(245,247,250,0.96))] p-5 shadow-[0_14px_30px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 font-semibold text-secondary shadow-inner">
                      {industry.title.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/75">Industry</p>
                      <h3 className="text-lg font-semibold text-secondary">{industry.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-secondary/80">{industry.description}</p>
                </div>
              ))}
            </ContentCarousel>
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

        {(sections.inquiry?.visible ?? true) && (
          <InquirySection
            id="contact"
            kicker={sections.inquiry?.kicker || 'Inquiry'}
            heading={siteSettings.inquiryForm?.heading || sections.inquiry?.title || 'Talk to an Expert'}
            description={
              siteSettings.inquiryForm?.description ||
              siteSettings.inquiryIntro ||
              'Tell us your requirement and our team will get back with the right machine recommendation.'
            }
            formTitle="Share your requirement"
            config={siteSettings.inquiryForm}
            quickLinks={quickLinks}
            fallbackPhone={primaryPhone}
            fallbackEmail={email}
            fallbackWhatsapp={whatsappNumber}
          />
        )}
      </main>
      <Footer
        companyName={companyName}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={contactNumbers}
        email={email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
      <FloatingSupport
        enabled={siteSettings.floatingSupportEnabled !== false}
        whatsappNumber={whatsappNumber}
        label={siteSettings.floatingSupportLabel || 'WhatsApp Support'}
      />
    </div>
  );
}
