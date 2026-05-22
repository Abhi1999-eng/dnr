import Link from 'next/link';

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
    { label: 'Contact', href: '/contact' },
  ],
  theme = 'dark',
}: FooterProps) {
  const hasCompanyLinks = footerLinks.length > 0;
  const hasContact = phoneNumbers.length > 0 || !!email || !!website || !!address;
  const isDark = theme === 'dark';

  return (
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
  );
}
