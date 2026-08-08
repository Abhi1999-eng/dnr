import Link from 'next/link';
import { StructuredData } from '@/components/StructuredData';
import { HOMEPAGE_FAQS, buildFaqPageJsonLd } from '@/lib/seo';

type FooterLink = {
  label: string;
  href: string;
};

type FooterProps = {
  companyName?: string;
  footerDescription?: string;
  phoneNumbers?: string[];
  email?: string;
  address?: string;
  website?: string;
  footerLinks?: FooterLink[];
  theme?: 'light' | 'dark';
};

export function Footer({
  companyName = 'DNR Techno Services',
  footerDescription = 'Industrial machinery, support, and engineering services for casting, machining, automation, and production teams across India.',
  phoneNumbers = [],
  email = '',
  address = '',
  website = '',
  footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'Products', href: '/products' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  theme = 'dark',
}: FooterProps) {
  const hasCompanyLinks = footerLinks.length > 0;
  const hasContact = phoneNumbers.length > 0 || !!email || !!website || !!address;
  const isDark = theme === 'dark';
  const faqSchema = buildFaqPageJsonLd();

  return (
    <>
      <StructuredData data={faqSchema} />
      <section id="faqs" className={isDark ? 'container-wide mt-14' : 'container-wide mt-14'}>
        <div className={isDark ? 'rounded-[28px] border border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(17,27,36,0.94),rgba(9,15,20,0.98))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] md:p-6 lg:p-7' : 'rounded-[28px] border border-secondary/10 bg-white p-5 shadow-[0_18px_40px_rgba(20,27,36,0.08)] md:p-6 lg:p-7'}>
          <div className="mx-auto max-w-3xl text-center">
            <p className={isDark ? 'text-xs font-semibold uppercase tracking-[0.22em] text-[#d5f4a8]' : 'text-xs font-semibold uppercase tracking-[0.22em] text-primary'}>FAQs</p>
            <h2 className={isDark ? 'mt-2 text-2xl font-semibold text-white md:text-3xl' : 'mt-2 text-2xl font-semibold text-secondary md:text-3xl'}>
              Frequently Asked Questions
            </h2>
            <p className={isDark ? 'mt-3 text-sm leading-7 text-[#aab4bd]' : 'mt-3 text-sm leading-7 text-secondary/70'}>
              Quick answers about DNR Techno Services, machinery supply, installation support, maintenance, and quote requests.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {HOMEPAGE_FAQS.map((item) => (
              <div key={item.question} className={isDark ? 'rounded-2xl border border-[rgba(126,211,33,0.12)] bg-white/[0.03] p-4 shadow-[0_12px_26px_rgba(0,0,0,0.14)]' : 'rounded-2xl border border-secondary/10 bg-secondary/[0.02] p-4 shadow-[0_12px_26px_rgba(20,27,36,0.06)]'}>
                <h3 className={isDark ? 'text-base font-semibold text-white' : 'text-base font-semibold text-secondary'}>{item.question}</h3>
                <p className={isDark ? 'mt-2 text-sm leading-7 text-[#aab4bd]' : 'mt-2 text-sm leading-7 text-secondary/72'}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={isDark ? 'mt-14 border-t border-[#7ed321]/12 bg-[linear-gradient(180deg,#0d141b,#071014)] py-10 text-white' : 'mt-14 border-t border-secondary/10 bg-[linear-gradient(180deg,#1b2430,#141b24)] py-10 text-white'}>
        <div className={`container-wide grid gap-8 text-sm ${hasCompanyLinks && hasContact ? 'md:grid-cols-[1.2fr_0.8fr_0.9fr]' : 'md:grid-cols-2'}`}>
          <div className="space-y-3">
            <div>
              <p className={isDark ? 'text-xs font-semibold uppercase tracking-[0.22em] text-[#d5f4a8]' : 'text-xs font-semibold uppercase tracking-[0.22em] text-primary'}>DNR Techno Services</p>
              <h3 className="mt-2 text-xl font-semibold">{companyName}</h3>
            </div>
            {footerDescription ? <p className={isDark ? 'max-w-md text-[#aab4bd]' : 'max-w-md text-white/88'}>{footerDescription}</p> : null}
          </div>

          {hasCompanyLinks ? (
            <div className="space-y-3">
              <h4 className={isDark ? 'font-semibold uppercase tracking-[0.16em] text-white/85' : 'font-semibold uppercase tracking-[0.16em] text-white/85'}>Company</h4>
              <div className="flex flex-col gap-2.5 text-white/92">
                {footerLinks.map((link) => (
                  <Link key={`${link.label}-${link.href}`} href={link.href} className={isDark ? 'transition hover:text-[#7ed321]' : 'transition hover:text-primary'}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {hasContact ? (
            <div className="space-y-3">
              <h4 className="font-semibold uppercase tracking-[0.16em] text-white/85">Contact</h4>
              <div className={isDark ? 'space-y-2 text-[#dbe4eb]' : 'space-y-2 text-white/92'}>
                {phoneNumbers.map((phone) => (
                  <a key={phone} href={`tel:${phone}`} className={isDark ? 'block transition hover:text-[#7ed321]' : 'block transition hover:text-primary'}>
                    {phone}
                  </a>
                ))}
                {email && (
                  <a href={`mailto:${email}`} className={isDark ? 'block transition hover:text-[#7ed321]' : 'block transition hover:text-primary'}>
                    {email}
                  </a>
                )}
                {website && (
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className={isDark ? 'block transition hover:text-[#7ed321]' : 'block transition hover:text-primary'}>
                    {website}
                  </a>
                )}
                {address && <p className={isDark ? 'pt-2 text-[#aab4bd]' : 'pt-2 text-white/82'}>{address}</p>}
              </div>
            </div>
          ) : null}
        </div>
      </footer>
    </>
  );
}
