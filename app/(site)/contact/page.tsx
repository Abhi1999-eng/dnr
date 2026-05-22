import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { InquiryForm } from '@/components/InquiryForm';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchPublicData } from '@/lib/data';
import { absoluteUrl, buildBreadcrumbJsonLd, buildOrganizationJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await fetchPublicData();
  const siteSettings: any = settings || {};
  return createPageMetadata({
    title: 'Contact',
    description:
      siteSettings.inquiryForm?.description ||
      siteSettings.inquiryIntro ||
      'Contact DNR Techno Services for machinery requirements, commissioning support, and plant engineering assistance.',
    path: '/contact',
  });
}

export default async function ContactPage() {
  const [{ settings }, products] = await Promise.all([fetchPublicData(), fetchLiveProducts()]);
  const siteSettings: any = settings || {};
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const whatsappNumber = siteSettings.whatsappNumber || primaryPhone;
  const email = siteSettings.email || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget || whatsappNumber, '#contact');
  const quickLinks = (siteSettings.contactQuickLinks || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const structuredData = [
    buildOrganizationJsonLd(siteSettings),
    buildBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Contact', url: absoluteUrl('/contact') },
    ]),
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
        <div className="space-y-3 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_20px_48px_rgba(0,0,0,0.26)] md:p-8">
          <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Contact</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">{siteSettings.inquiryForm?.heading || 'Talk to an engineer'}</h1>
          <p className="max-w-3xl text-lg text-slate-300">
            {siteSettings.inquiryForm?.description || siteSettings.inquiryIntro || 'Share your requirement, machine type, and project timeline. We will connect you with the right DNR contact quickly.'}
          </p>
        </div>

        <div id="contact" className="grid gap-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.96),rgba(10,16,20,0.98))] p-6 shadow-[0_24px_54px_rgba(0,0,0,0.28)] scroll-mt-28 lg:grid-cols-[0.9fr,1.1fr] lg:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Quick contact</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Reach the DNR team</h2>
            </div>
            <div className="space-y-3">
              {quickLinks.length ? (
                quickLinks.map((item: any) => {
                  const href =
                    item.href ||
                    (item.type === 'phone'
                      ? `tel:${item.value}`
                      : item.type === 'email'
                        ? `mailto:${item.value}`
                        : item.type === 'whatsapp'
                          ? `https://wa.me/${String(item.value || '').replace(/[^0-9]/g, '')}`
                          : item.value);
                  const external = item.type === 'whatsapp' || String(href).startsWith('http');
                  return (
                    <a key={`${item.label}-${item.value}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-[#7ed321]/35 hover:bg-[#7ed321]/8">
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="text-lg font-semibold text-white">{item.value}</p>
                    </a>
                  );
                })
              ) : (
                <>
                  {primaryPhone && <a href={`tel:${primaryPhone}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"><p className="text-sm text-slate-400">Primary phone</p><p className="text-lg font-semibold text-white">{primaryPhone}</p></a>}
                  {secondaryPhone && <a href={`tel:${secondaryPhone}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"><p className="text-sm text-slate-400">Secondary phone</p><p className="text-lg font-semibold text-white">{secondaryPhone}</p></a>}
                  {email && <a href={`mailto:${email}`} className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"><p className="text-sm text-slate-400">Email</p><p className="text-lg font-semibold text-white">{email}</p></a>}
                  {whatsappNumber && <a href={`https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"><p className="text-sm text-slate-400">WhatsApp</p><p className="text-lg font-semibold text-white">{whatsappNumber}</p></a>}
                </>
              )}
            </div>
            {siteSettings.address && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Office</p>
                <p className="mt-2 text-slate-300">{siteSettings.address}</p>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#0b1218] p-1">
            <InquiryForm theme="dark" config={siteSettings.inquiryForm} />
          </div>
        </div>
      </main>
      <Footer
        theme="dark"
        companyName={companyName}
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
    </div>
  );
}
