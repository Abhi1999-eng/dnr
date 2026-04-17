import { Footer } from '@/components/Footer';
import { InquiryForm } from '@/components/InquiryForm';
import { Nav } from '@/components/Nav';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const { settings } = await fetchPublicData();
  const companyName = settings?.companyName || 'DNR Techno Services';
  const logo = settings?.logo || '/logo-dnr.png';
  const primaryPhone = settings?.primaryPhone || settings?.phone?.[0] || '';
  const secondaryPhone = settings?.secondaryPhone || settings?.phone?.[1] || '';
  const whatsappNumber = settings?.whatsappNumber || primaryPhone;
  const email = settings?.email || '';
  const headerCtaHref = resolveContactActionHref(settings?.headerCtaActionType, settings?.headerCtaValue || settings?.headerCtaTarget || whatsappNumber, '#contact');
  const quickLinks = (settings?.contactQuickLinks || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
      />
      <main className="container-wide max-w-6xl space-y-8 pb-20 pt-16">
        <div className="space-y-3">
          <p className="pill inline-flex">Contact</p>
          <h1 className="text-4xl font-semibold text-secondary md:text-5xl">{settings?.inquiryForm?.heading || 'Talk to an engineer'}</h1>
          <p className="max-w-3xl text-lg text-secondary/80">
            {settings?.inquiryForm?.description || settings?.inquiryIntro || 'Share your requirement, machine type, and project timeline. We will connect you with the right DNR contact quickly.'}
          </p>
        </div>

        <div id="contact" className="grid gap-8 rounded-3xl border border-secondary/10 bg-white p-8 shadow-lg shadow-secondary/10 lg:grid-cols-[0.9fr,1.1fr] scroll-mt-28">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary/50">Quick contact</p>
              <h2 className="mt-2 text-2xl font-semibold text-secondary">Reach the DNR team</h2>
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
                    <a key={`${item.label}-${item.value}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block rounded-2xl border border-secondary/10 bg-muted/30 px-4 py-4 transition hover:border-primary/40 hover:bg-primary/5">
                      <p className="text-sm text-secondary/60">{item.label}</p>
                      <p className="text-lg font-semibold text-secondary">{item.value}</p>
                    </a>
                  );
                })
              ) : (
                <>
                  {primaryPhone && <a href={`tel:${primaryPhone}`} className="block rounded-2xl border border-secondary/10 bg-muted/30 px-4 py-4"><p className="text-sm text-secondary/60">Primary phone</p><p className="text-lg font-semibold text-secondary">{primaryPhone}</p></a>}
                  {secondaryPhone && <a href={`tel:${secondaryPhone}`} className="block rounded-2xl border border-secondary/10 bg-muted/30 px-4 py-4"><p className="text-sm text-secondary/60">Secondary phone</p><p className="text-lg font-semibold text-secondary">{secondaryPhone}</p></a>}
                  {email && <a href={`mailto:${email}`} className="block rounded-2xl border border-secondary/10 bg-muted/30 px-4 py-4"><p className="text-sm text-secondary/60">Email</p><p className="text-lg font-semibold text-secondary">{email}</p></a>}
                  {whatsappNumber && <a href={`https://wa.me/${String(whatsappNumber).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="block rounded-2xl border border-secondary/10 bg-muted/30 px-4 py-4"><p className="text-sm text-secondary/60">WhatsApp</p><p className="text-lg font-semibold text-secondary">{whatsappNumber}</p></a>}
                </>
              )}
            </div>
            {settings?.address && (
              <div className="rounded-2xl border border-secondary/10 bg-secondary px-5 py-4 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Office</p>
                <p className="mt-2 text-white/85">{settings.address}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-secondary/10 bg-white p-1">
            <InquiryForm config={settings?.inquiryForm} />
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
