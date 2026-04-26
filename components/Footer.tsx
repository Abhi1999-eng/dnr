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
}: FooterProps) {
  const hasCompanyLinks = footerLinks.length > 0;
  const hasContact = phoneNumbers.length > 0 || !!email || !!website || !!address;

  return (
    <footer className="mt-20 border-t border-secondary/10 bg-[linear-gradient(180deg,#1b2430,#141b24)] py-14 text-white">
      <div className={`container-wide grid gap-10 text-sm ${hasCompanyLinks && hasContact ? 'md:grid-cols-[1.2fr_0.8fr_0.9fr]' : 'md:grid-cols-2'}`}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">DNR Techno Services</p>
            <h3 className="mt-2 text-2xl font-semibold">{companyName}</h3>
          </div>
          {footerDescription ? <p className="max-w-md text-white/88">{footerDescription}</p> : null}
        </div>

        {hasCompanyLinks ? (
          <div className="space-y-4">
            <h4 className="font-semibold uppercase tracking-[0.16em] text-white/85">Company</h4>
            <div className="flex flex-col gap-3 text-white/92">
              {footerLinks.map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href} className="transition hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {hasContact ? (
          <div className="space-y-4">
            <h4 className="font-semibold uppercase tracking-[0.16em] text-white/85">Contact</h4>
            <div className="space-y-2 text-white/92">
              {phoneNumbers.map((phone) => (
                <a key={phone} href={`tel:${phone}`} className="block transition hover:text-primary">
                  {phone}
                </a>
              ))}
              {email && (
                <a href={`mailto:${email}`} className="block transition hover:text-primary">
                  {email}
                </a>
              )}
              {website && (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="block transition hover:text-primary">
                  {website}
                </a>
              )}
              {address && <p className="pt-2 text-white/82">{address}</p>}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
