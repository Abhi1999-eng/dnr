import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { StructuredData } from '@/components/StructuredData';
import { ManagedImage } from '@/components/ManagedImage';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchPublicData, fetchRelatedServices, fetchServiceBySlug } from '@/lib/data';
import { absoluteUrl, buildBreadcrumbJsonLd, buildServiceJsonLd, createPageMetadata } from '@/lib/seo';
import { resolveServiceImage } from '@/lib/media';
import { normalizeExpectedOutcomes } from '@/lib/service-outcomes';

export const revalidate = 300;

const serviceFaqs = [
  {
    question: 'How do I know if this service fits my plant requirement?',
    answer: 'Share your machine type, production challenge, or project scope with DNR and the team will guide you to the most relevant service path.',
  },
  {
    question: 'Can DNR coordinate support around machine uptime and commissioning?',
    answer: 'Yes. DNR supports industrial teams with practical coordination around commissioning, troubleshooting, maintenance planning, and execution support where applicable.',
  },
  {
    question: 'How do I start the inquiry process?',
    answer: 'Use the Send Inquiry button on this page to share your requirement. A DNR representative can follow up with the right next steps for your project or support need.',
  },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service: any = await fetchServiceBySlug(slug);

  if (!service) {
    return createPageMetadata({
      title: 'Service not found',
      description: 'The requested service could not be found.',
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.longDescription || service.description,
    path: `/services/${service.slug}`,
    image: resolveServiceImage(service),
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, related, { settings }, products] = await Promise.all([
    fetchServiceBySlug(slug),
    fetchRelatedServices(slug, 3),
    fetchPublicData(),
    fetchLiveProducts(),
  ]);
  const siteSettings: any = settings || {};
  const serviceData: any = service;
  const relatedServices: any[] = Array.isArray(related) ? related : [];

  if (!serviceData) {
    notFound();
  }
  const contactHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const structuredData = [
    buildBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Services', url: absoluteUrl('/services') },
      { name: serviceData.title, url: absoluteUrl(`/services/${serviceData.slug}`) },
    ]),
    buildServiceJsonLd(serviceData),
  ];

  const detailCopy =
    serviceData.longDescription ||
    serviceData.description ||
    'Talk to DNR Techno Services for service planning, implementation support, and plant-side guidance tailored to your operating requirements.';

  const serviceImage = resolveServiceImage(serviceData);

  const supportPoints = normalizeExpectedOutcomes(serviceData.expectedOutcomes).length
    ? normalizeExpectedOutcomes(serviceData.expectedOutcomes)
    : [
        'Clear project coordination and technical alignment before work begins',
        'Practical support for uptime, commissioning, and production continuity',
        'Responsive communication so plant teams know the next step quickly',
      ];

  const audiencePoints = [
    'Manufacturing teams planning a new installation, retrofit, or production upgrade.',
    'Plant teams that need structured troubleshooting, uptime support, or execution coordination.',
    'Industrial buyers comparing support capability before choosing a machinery or service partner.',
  ];

  return (
    <div className="min-h-screen bg-[#071014] text-white">
      <StructuredData data={structuredData} />
      <Nav
        companyName={siteSettings.companyName || 'DNR Techno Services'}
        logo={siteSettings.logo || '/logo-dnr.png'}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Get in Touch'}
        headerCtaTarget={contactHref}
        products={products || []}
        theme="dark"
      />
      <main className="container-wide space-y-8 pb-16 pt-12 md:pb-20 md:pt-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-[#d5f4a8]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/services" className="transition hover:text-[#d5f4a8]">Services</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-200">{serviceData.title}</span>
        </nav>

        <section className="grid gap-8 rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(17,27,36,0.98),rgba(10,16,20,0.98))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.32)] md:grid-cols-[1.05fr_0.95fr] md:p-10">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d5f4a8]">Service detail</span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">{serviceData.title}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-300">{serviceData.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex h-[52px] items-center justify-center rounded-xl bg-[linear-gradient(120deg,#8bc53f,#79b535_68%,#6aa12f)] px-7 text-sm font-semibold text-[#15200d] shadow-[0_14px_30px_rgba(139,197,63,0.22)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(139,197,63,0.26)]">
                Send Inquiry
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1218] p-6 shadow-[0_20px_44px_rgba(0,0,0,0.24)] md:min-h-[320px] md:p-8">
            <ManagedImage
              src={serviceImage}
              alt={serviceData.imageAlt || serviceData.title}
              fill
              className="object-contain object-center p-4 md:p-6"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-7 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
              <h2 className="text-2xl font-semibold text-white">What this service covers</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-300">{detailCopy}</p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-7 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
              <h2 className="text-2xl font-semibold text-white">Who it is for</h2>
              <ul className="mt-4 space-y-3">
                {audiencePoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7ed321]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
              <h2 className="text-xl font-semibold text-white">How DNR supports</h2>
              <ul className="mt-4 space-y-3">
                {supportPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7ed321]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#7ed321]/16 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 text-white shadow-[0_18px_44px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5f4a8]">Need help fast?</p>
              <h2 className="mt-3 text-2xl font-semibold">Send your requirement</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Share your machine type, plant requirement, or support need and we’ll guide you to the right contact.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex h-[52px] items-center justify-center rounded-xl bg-[linear-gradient(120deg,#8bc53f,#79b535_68%,#6aa12f)] px-7 text-sm font-semibold text-[#15200d] shadow-[0_14px_30px_rgba(139,197,63,0.22)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(139,197,63,0.26)]">
                  Send Inquiry
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
          <div className="space-y-1">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">FAQs</p>
            <h2 className="text-2xl font-semibold text-white">Common questions</h2>
          </div>
          <div className="mt-5 space-y-4">
            {serviceFaqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-base font-semibold text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {relatedServices.length ? (
          <section className="space-y-5">
            <div>
              <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Related services</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">More support capabilities</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedServices.map((item: any) => (
                <Link
                  key={item._id || item.slug}
                  href={`/services/${item.slug}`}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-[#7ed321]/35 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                >
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description || 'View service details'}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[#7ed321]">Learn more →</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer
        theme="dark"
        companyName={siteSettings.companyName || 'DNR Techno Services'}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={[siteSettings.primaryPhone || siteSettings.phone?.[0], siteSettings.secondaryPhone || siteSettings.phone?.[1]].filter(Boolean)}
        email={siteSettings.email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
    </div>
  );
}
