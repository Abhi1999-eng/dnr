import Image from 'next/image';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { SiteSettings } from '@/models/SiteSettings';

export const dynamic = 'force-dynamic';

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const [serviceDoc, relatedDocs, settingsDocRaw] = await Promise.all([
    Service.findOne({ slug, active: { $ne: false } }).lean(),
    Service.find({ slug: { $ne: slug }, active: { $ne: false } }).sort({ sortOrder: 1, createdAt: 1 }).limit(3).lean(),
    SiteSettings.findOne().lean(),
  ]);
  const settingsDoc: any = settingsDocRaw;

  if (!serviceDoc) {
    return (
      <div className="min-h-screen bg-background text-secondary">
        <Nav
          companyName={settingsDoc?.companyName || 'DNR Techno Services'}
          logo={settingsDoc?.logo || '/logo-dnr.png'}
          headerCtaLabel={settingsDoc?.headerCtaLabel || 'Talk to an Expert'}
          headerCtaTarget={resolveContactActionHref(settingsDoc?.headerCtaActionType, settingsDoc?.headerCtaValue || settingsDoc?.headerCtaTarget, '#contact')}
        />
        <main className="container-wide space-y-6 pb-20 pt-16">
          <p className="pill inline-flex">Services</p>
          <h1 className="text-4xl font-semibold text-secondary">Service not found</h1>
          <p className="max-w-2xl text-secondary/75">This service is no longer available or has not been added yet.</p>
          <Link href="/services" className="btn-ghost w-fit">
            Back to services
          </Link>
        </main>
      </div>
    );
  }

  const service = JSON.parse(JSON.stringify(serviceDoc));
  const related = JSON.parse(JSON.stringify(relatedDocs || []));
  const settings = JSON.parse(JSON.stringify(settingsDoc || {}));
  const contactHref = resolveContactActionHref(settings?.headerCtaActionType, settings?.headerCtaValue || settings?.headerCtaTarget, '#contact');

  const detailCopy =
    service.longDescription ||
    service.description ||
    'Talk to DNR Techno Services for service planning, implementation support, and plant-side guidance tailored to your operating requirements.';

  const supportPoints = [
    'Clear project coordination and technical alignment before work begins',
    'Practical support for uptime, commissioning, and production continuity',
    'Responsive communication so plant teams know the next step quickly',
  ];

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Nav
        companyName={settings?.companyName || 'DNR Techno Services'}
        logo={settings?.logo || '/logo-dnr.png'}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={contactHref}
      />
      <main className="container-wide space-y-10 pb-20 pt-16">
        <Link href="/services" className="inline-flex text-sm font-semibold text-primary hover:underline">
          ← Back to services
        </Link>

        <section className="grid gap-8 rounded-[30px] border border-secondary/10 bg-[linear-gradient(135deg,#ffffff,rgba(245,247,250,0.96),rgba(230,244,214,0.74))] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)] md:grid-cols-[1.05fr_0.95fr] md:p-10">
          <div className="space-y-5">
            <span className="pill inline-flex">Service detail</span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-secondary md:text-5xl">{service.title}</h1>
              <p className="max-w-2xl text-lg leading-relaxed text-secondary/80">{service.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={contactHref} className="btn-primary">
                {settings?.headerCtaLabel || 'Talk to an Expert'}
              </Link>
              <Link href="/contact" className="btn-ghost">
                Send Inquiry
              </Link>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-[26px] border border-secondary/10 bg-secondary/5 shadow-lg shadow-secondary/10">
            <Image
              src={service.image || '/dnr/page_21.png'}
              alt={service.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-secondary/10 bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold text-secondary">Overview</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-secondary/80">{detailCopy}</p>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-secondary/10 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
              <h2 className="text-xl font-semibold text-secondary">What you can expect</h2>
              <ul className="mt-4 space-y-3">
                {supportPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-secondary/80">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-secondary/10 bg-secondary p-6 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Need help fast?</p>
              <h3 className="mt-3 text-2xl font-semibold">Get the right next step from DNR</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Share your machine type, plant requirement, or support need and we’ll guide you to the right contact.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={contactHref} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-secondary">
                  Talk to an Expert
                </Link>
                <Link href="/contact" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
                  Send Inquiry
                </Link>
              </div>
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="space-y-5">
            <div>
              <p className="pill inline-flex">Related services</p>
              <h2 className="mt-3 text-3xl font-semibold text-secondary">More support capabilities</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item: any) => (
                <Link
                  key={item._id || item.slug}
                  href={`/services/${item.slug}`}
                  className="rounded-[24px] border border-secondary/10 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)]"
                >
                  <h3 className="text-lg font-semibold text-secondary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary/75">{item.description || 'View service details'}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-primary">Learn more →</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer
        companyName={settings?.companyName || 'DNR Techno Services'}
        footerDescription={settings?.footerDescription}
        phoneNumbers={[settings?.primaryPhone || settings?.phone?.[0], settings?.secondaryPhone || settings?.phone?.[1]].filter(Boolean)}
        email={settings?.email}
        address={settings?.address}
        website={settings?.website}
        footerLinks={settings?.footerLinks}
      />
    </div>
  );
}
