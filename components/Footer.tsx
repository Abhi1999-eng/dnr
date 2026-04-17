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
    <footer className="mt-20 border-t border-secondary/10 bg-secondary py-12 text-white">
      <div className={`container-wide grid gap-8 text-sm ${hasCompanyLinks && hasContact ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <div>
          <h3 className="text-xl font-semibold">{companyName}</h3>
          {footerDescription ? <p className="mt-3 max-w-md text-white/70">{footerDescription}</p> : null}
        </div>

        {hasCompanyLinks ? (
          <div>
            <h4 className="font-semibold">Company</h4>
            <div className="mt-3 flex flex-col gap-2 text-white/80">
              {footerLinks.map((link) => (
                <Link key={`${link.label}-${link.href}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {hasContact ? (
          <div>
            <h4 className="font-semibold">Contact</h4>
            <div className="mt-3 space-y-1 text-white/80">
              {phoneNumbers.map((phone) => (
                <a key={phone} href={`tel:${phone}`} className="block hover:text-white">
                  {phone}
                </a>
              ))}
              {email && (
                <a href={`mailto:${email}`} className="block hover:text-white">
                  {email}
                </a>
              )}
              {website && (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="block hover:text-white">
                  {website}
                </a>
              )}
              {address && <p className="pt-2 text-white/65">{address}</p>}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
