import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  MapPinned,
  Settings2,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { FloatingSupport } from '@/components/FloatingSupport';
import { Footer } from '@/components/Footer';
import { ManagedImage } from '@/components/ManagedImage';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { SectionTitle } from '@/components/SectionTitle';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';
import { resolveMediaUrl, resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildOrganizationJsonLd, buildWebsiteJsonLd, createPageMetadata } from '@/lib/seo';

const ClientLogosSection = dynamic(() => import('@/components/ClientLogosSection').then((mod) => mod.ClientLogosSection));
const ContentCarousel = dynamic(() => import('@/components/ContentCarousel').then((mod) => mod.ContentCarousel));
const Coverage = dynamic(() => import('@/components/Coverage').then((mod) => mod.Coverage));
const InquirySection = dynamic(() => import('@/components/InquirySection').then((mod) => mod.InquirySection));
const ProductGrid = dynamic(() => import('@/components/ProductGrid').then((mod) => mod.ProductGrid));
const ServiceGrid = dynamic(() => import('@/components/ServiceGrid').then((mod) => mod.ServiceGrid));
const Testimonials = dynamic(() => import('@/components/Testimonials').then((mod) => mod.Testimonials));
const TrustSection = dynamic(() => import('@/components/TrustSection').then((mod) => mod.TrustSection));

export const revalidate = 300;

const heroFeatureItems = [
  { label: 'Precision Engineering', icon: Settings2 },
  { label: 'Quality Assured', icon: ShieldCheck },
  { label: 'Timely Delivery', icon: Truck },
  { label: 'After Sales Support', icon: Wrench },
  { label: 'Pan India Service', icon: MapPinned },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const { settings, homepage, products } = await fetchPublicData();
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
  const { testimonials, homepage, settings, services, products = [], clientLogos = [] } = await fetchPublicData();
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
  const heroHeadingLines = hero.heading
    ? String(hero.heading)
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : ['Industrial Machinery', 'Supply & Support', 'Across India'];
  const heroSubheading =
    hero.subheading ||
    'Precision machines, installation support, breakdown maintenance, and spare parts coordination for manufacturing teams across India.';
  const heroPrimaryCta = hero.ctaPrimary || 'View Products';
  const heroSecondaryCta = 'Get in Touch';
  const about = homepageData?.about || { heading: '', body: '', bullets: [] };
  const whyCards = (homepageData?.why || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const industries = ((homepageData?.industries as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const trustCards = ((homepageData?.trustCards as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const coverageEntries = ((homepageData?.coverageStates as any[]) || []).filter((item) => item.active !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const coverageStateDescriptions = Object.fromEntries(coverageEntries.map((item: any) => [item.stateId, item.description]));
  const coverageStateLabels = Object.fromEntries(coverageEntries.map((item: any) => [item.stateId, item.label]));
  const coverageStates = coverageEntries.map((item: any) => item.stateId);
  const productsSection = sections.products || {};
  const heroMetaImage = resolveProductImage(products?.[0], resolveMediaUrl(siteSettings.seo?.ogImage || siteSettings.logo, '/logo-dnr.png'));
  const heroVisualProducts = products.slice(0, 3);
  const structuredData = [
    buildOrganizationJsonLd(siteSettings),
    buildWebsiteJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: heroHeadingLines.join(' '),
      description: heroSubheading,
      url: absoluteUrl('/'),
      primaryImageOfPage: heroMetaImage.startsWith('http') ? heroMetaImage : absoluteUrl(heroMetaImage),
    },
  ];

  return (
    <div className="industrial-home bg-[#071014] text-white">
      <StructuredData data={structuredData} />
      <Nav companyName={companyName} logo={logo} headerCtaLabel={heroSecondaryCta} headerCtaTarget={headerCtaHref} products={products || []} theme="dark" />
      <main className="space-y-8 pb-12 pt-5 md:space-y-10 md:pt-6 lg:pt-7">
        {(sections.hero?.visible ?? true) && (
          <section id="hero" className="container-wide py-1 lg:min-h-[calc(100svh-110px)] lg:py-2">
            <div className="industrial-shell relative rounded-[32px] border border-[rgba(126,211,33,0.22)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.32)] md:p-6 lg:px-8 lg:pt-8 lg:pb-6">
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(126,211,33,0.14),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(126,211,33,0.1),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_30%,rgba(126,211,33,0.05))]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(126,211,33,0.55),transparent)]" />
              <div className="pointer-events-none absolute left-0 top-1/3 h-40 w-40 rounded-full bg-[#7ed321]/8 blur-3xl" />
              <div className="pointer-events-none absolute right-0 top-6 h-52 w-52 rounded-full bg-[#7ed321]/7 blur-3xl" />

              <div className="relative z-10 grid gap-2 sm:grid-cols-2 xl:grid-cols-5 xl:gap-2">
                {heroFeatureItems.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex min-h-[44px] items-center gap-2 rounded-2xl border border-[rgba(126,211,33,0.16)] bg-white/[0.03] px-3 py-2 text-[12px] text-[#dbe4eb] shadow-[0_10px_20px_rgba(0,0,0,0.14)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(126,211,33,0.28)] bg-[#7ed321]/10 text-[#7ed321]">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="font-medium leading-snug">{label}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-4 grid items-center gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8">
                <div className="space-y-4">
                  <div className="space-y-3.5">
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d5f4a8] md:text-xs">Industrial Machinery &amp; Engineering Support</p>
                    <h1 className="max-w-[680px] text-3xl font-semibold leading-[0.98] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[48px] 2xl:text-[52px]">
                      {heroHeadingLines.map((line, index) => (
                        <span key={`${line}-${index}`} className={`block ${index === 1 ? 'text-[#7ed321]' : ''}`}>
                          {line}
                        </span>
                      ))}
                    </h1>
                    <p className="mb-5 max-w-[620px] text-base leading-7 text-slate-300">
                      {heroSubheading}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link href="#products" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#7ed321]/40 bg-[linear-gradient(120deg,#8cd62a,#72be20_70%,#65a91b)] px-6 text-sm font-semibold text-[#09110f] shadow-[0_14px_28px_rgba(126,211,33,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(126,211,33,0.22)]">
                      {heroPrimaryCta}
                      <ArrowRight size={18} />
                    </Link>
                    <Link href={headerCtaHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[rgba(126,211,33,0.28)] bg-white/[0.03] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#7ed321]/46 hover:bg-[#7ed321]/8">
                      {heroSecondaryCta}
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#dbe4eb]">
                    {['Precision machines', 'Installation support', 'Breakdown maintenance', 'Spare parts support'].map((item) => (
                      <span key={item} className="rounded-full border border-[rgba(126,211,33,0.18)] bg-white/[0.04] px-3 py-1.5 shadow-[0_10px_20px_rgba(0,0,0,0.14)]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[260px] rounded-[26px] border border-[rgba(126,211,33,0.18)] bg-[linear-gradient(180deg,rgba(17,27,36,0.94),rgba(8,14,18,0.98))] p-4 shadow-[0_20px_44px_rgba(0,0,0,0.3)] md:min-h-[320px] lg:min-h-[340px] lg:max-h-[380px]">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_70%_28%,rgba(126,211,33,0.16),transparent_26%),linear-gradient(145deg,rgba(255,255,255,0.03),transparent_35%,rgba(126,211,33,0.04))]" />
                  <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d5f4a8]">Plant-ready support</p>
                      <h2 className="mt-1 max-w-xs text-lg font-semibold leading-tight text-white md:text-[1.45rem]">Practical support for production teams</h2>
                    </div>
                    <div className="hidden rounded-full border border-[rgba(126,211,33,0.22)] bg-[#7ed321]/10 px-2.5 py-1 text-[11px] font-semibold text-[#d5f4a8] md:inline-flex">
                      Across India
                    </div>
                  </div>

                  <svg viewBox="0 0 420 300" className="pointer-events-none absolute right-2 top-10 h-[130px] w-[160px] opacity-55 md:h-[170px] md:w-[210px]" aria-hidden="true">
                    <path d="M192 18l34 15 14 33-12 30 16 31-11 35-22 12-13 31-30 11-28-14-14-25-28-9-10-24 10-32-17-26 12-33 27-11 16-28 28-6z" fill="none" stroke="rgba(126,211,33,0.38)" strokeWidth="2" />
                    {[
                      [192, 28], [217, 55], [202, 95], [231, 128], [209, 170], [183, 205], [155, 182], [141, 143], [161, 106], [175, 70], [126, 120], [247, 92], [260, 150], [212, 225],
                    ].map(([cx, cy], index) => (
                      <g key={`${cx}-${cy}-${index}`}>
                        <circle cx={cx} cy={cy} r="4" fill="#7ed321" />
                        <circle cx={cx} cy={cy} r="13" fill="rgba(126,211,33,0.15)" />
                      </g>
                    ))}
                    {[
                      [192, 28, 217, 55], [217, 55, 202, 95], [202, 95, 231, 128], [202, 95, 161, 106], [161, 106, 141, 143], [231, 128, 209, 170], [209, 170, 183, 205], [183, 205, 155, 182], [217, 55, 247, 92], [247, 92, 260, 150], [155, 182, 212, 225],
                    ].map(([x1, y1, x2, y2], index) => (
                      <line key={`${index}-${x1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(126,211,33,0.25)" strokeWidth="1.5" />
                    ))}
                  </svg>

                  <div className="absolute inset-x-4 bottom-4 top-[6.1rem] md:top-[6.6rem]">
                    <div className="relative h-full">
                      <div className="absolute left-[2%] top-[26%] h-[34%] w-[28%] rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-2 shadow-[0_14px_28px_rgba(0,0,0,0.22)]">
                        <ManagedImage
                          src={resolveProductImage(heroVisualProducts[1], '/dnr/page_06.png')}
                          fallbackSrc="/dnr/page_06.png"
                          alt={heroVisualProducts[1]?.title || 'DNR product preview'}
                          fill
                          className="object-contain object-bottom p-2"
                          sizes="(max-width: 1024px) 35vw, 20vw"
                        />
                      </div>
                      <div className="absolute left-[24%] top-[8%] h-[60%] w-[44%] rounded-[22px] border border-[rgba(126,211,33,0.2)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
                        <ManagedImage
                          src={resolveProductImage(heroVisualProducts[0], '/dnr/page_14.png')}
                          fallbackSrc="/dnr/page_14.png"
                          alt={heroVisualProducts[0]?.title || 'DNR machine spotlight'}
                          fill
                          priority
                          className="object-contain object-bottom p-3"
                          sizes="(max-width: 1024px) 60vw, 30vw"
                        />
                      </div>
                      <div className="absolute right-[1%] top-[18%] h-[44%] w-[28%] rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-2 shadow-[0_14px_28px_rgba(0,0,0,0.22)]">
                        <ManagedImage
                          src={resolveProductImage(heroVisualProducts[2], '/dnr/page_21.png')}
                          fallbackSrc="/dnr/page_21.png"
                          alt={heroVisualProducts[2]?.title || 'DNR support machine'}
                          fill
                          className="object-contain object-bottom p-2"
                          sizes="(max-width: 1024px) 35vw, 20vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {about.heading || about.body || about.bullets.length ? (
          <Reveal>
            <section id="about" className="container-wide">
              <div className="rounded-[28px] border border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(17,27,36,0.94),rgba(9,15,20,0.98))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] md:p-6 lg:p-7">
                <SectionTitle theme="dark" eyebrow="About DNR" title={about.heading || 'Engineering support that stays close to production'} kicker={about.body || undefined} />
                {about.bullets.length ? (
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {about.bullets.map((bullet: string, index: number) => (
                      <Reveal key={bullet} delay={index * 0.05} className="h-full">
                        <div className="flex h-full items-start gap-3 rounded-2xl border border-[rgba(126,211,33,0.12)] bg-white/[0.03] p-3.5 text-sm text-[#dbe4eb] shadow-[0_12px_26px_rgba(0,0,0,0.14)]">
                          <span className="mt-1.5 h-3 w-3 rounded-full bg-[#7ed321]" />
                          <span>{bullet}</span>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </Reveal>
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
            theme="dark"
            title={productsSection.title || 'Machine portfolio'}
            kicker={productsSection.kicker || 'Production-ready machinery and plant support for foundry, machining, casting, automation, and finishing environments.'}
            emptyTitle="No products added yet"
            emptyDescription="Add products from the admin panel and they will automatically appear on the homepage and products page."
          />
        )}

        {(sections.services?.visible ?? true) && services.length > 0 && (
          <ServiceGrid
            id="services"
            services={services || []}
            theme="dark"
            title={sections.services?.title || 'Service coordination for uptime-critical plants'}
            kicker={sections.services?.kicker || 'Installation, commissioning, diagnostics, breakdown response, AMC support, and spare-parts continuity delivered with plant-side practicality.'}
          />
        )}

        {(sections.whyChoose?.visible ?? true) && whyCards.length > 0 && (
          <Reveal>
            <section id="why" className="container-wide">
              <div className="rounded-[28px] border border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(17,27,36,0.94),rgba(9,15,20,0.98))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] md:p-6 lg:p-7">
                <SectionTitle theme="dark" title={sections.whyChoose?.title || 'Why manufacturing teams choose DNR'} kicker={sections.whyChoose?.kicker || undefined} eyebrow="Why choose DNR" />
                <div className="mt-4 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                  {whyCards.map((item: any, index: number) => (
                    <Reveal key={item.title} delay={index * 0.06} className="h-full">
                      <div className="h-full rounded-2xl border border-[rgba(126,211,33,0.12)] bg-white/[0.03] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:border-[#7ed321]/34 hover:shadow-[0_20px_40px_rgba(0,0,0,0.22)]">
                        <h3 className="text-base font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#aab4bd]">{item.description}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        )}

        <Coverage
          states={coverageStates}
          theme="dark"
          title={sections.coverage?.title || 'Pan-India coverage'}
          kicker={sections.coverage?.kicker || 'Service presence across key manufacturing belts, with install, maintenance, and response support where DNR customers operate.'}
          summaryTitle={sections.coverage?.summaryTitle || 'Coverage network'}
          summaryText={sections.coverage?.summaryText || 'DNR supports installs, service calls, and partner-led response where customers run foundry, machining, automation, and industrial engineering operations.'}
          stateDescriptions={coverageStateDescriptions}
          stateLabels={coverageStateLabels}
        />

        {(sections.industries?.visible ?? true) && industries.length > 0 && (
          <section id="industries" className="container-wide space-y-5">
            <SectionTitle
              theme="dark"
              eyebrow="Industries & applications"
              title={sections.industries?.title || 'Where DNR machinery runs'}
              kicker={sections.industries?.kicker || 'Capability across casting cells, machining lines, automation, and finishing environments with practical service support.'}
            />
            <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }} theme="dark">
              {industries.map((industry: any, index: number) => (
                <Reveal key={industry.title} delay={index * 0.06} className="h-full">
                  <div className="h-full rounded-[22px] border border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(10,16,20,0.98))] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-[#7ed321]/38 hover:shadow-[0_20px_40px_rgba(0,0,0,0.26)]">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[rgba(126,211,33,0.24)] bg-[#7ed321]/10 font-semibold text-[#7ed321] shadow-inner">
                        {industry.title.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Industry</p>
                        <h3 className="text-base font-semibold text-white">{industry.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[#aab4bd]">{industry.description}</p>
                  </div>
                </Reveal>
              ))}
            </ContentCarousel>
          </section>
        )}

        {(sections.testimonials?.visible ?? true) && testimonials.length > 0 && (
          <section id="testimonials">
            <Testimonials
              testimonials={testimonials}
              theme="dark"
              title={sections.testimonials?.title || 'Trusted by plant heads and maintenance leaders'}
              kicker={sections.testimonials?.kicker || 'High-uptime plants choose DNR for reliable installs, responsive service, and clear communication.'}
            />
          </section>
        )}

        {(sections.trust?.visible ?? true) && trustCards.length > 0 && (
          <TrustSection
            theme="dark"
            title={sections.trust?.title || 'Trusted across manufacturing'}
            kicker={sections.trust?.kicker || 'Operational proof instead of placeholders.'}
            cards={trustCards.map((card: any) => ({ title: card.title, desc: card.description }))}
          />
        )}

        {(sections.clients?.visible ?? true) && clientLogos.length > 0 && (
          <ClientLogosSection
            theme="dark"
            title={sections.clients?.title || 'Associated Brands'}
            kicker={sections.clients?.kicker || 'Customer and brand relationships from DNR project materials.'}
            logos={clientLogos || []}
          />
        )}

        {(sections.inquiry?.visible ?? true) && (
          <InquirySection
            id="contact"
            theme="dark"
            kicker={sections.inquiry?.kicker || 'Inquiry'}
            heading={siteSettings.inquiryForm?.heading || sections.inquiry?.title || 'Get in Touch'}
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
        theme="dark"
        companyName={companyName}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={contactNumbers}
        email={email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
      <FloatingSupport enabled={siteSettings.floatingSupportEnabled !== false} whatsappNumber={whatsappNumber} label={siteSettings.floatingSupportLabel || 'WhatsApp Support'} />
    </div>
  );
}
