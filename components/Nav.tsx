'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MouseEvent, useState } from 'react';

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#products', label: 'Products' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

type NavProps = {
  companyName?: string;
  logo?: string;
  headerCtaLabel?: string;
  headerCtaTarget?: string;
};

function isExternalTarget(target?: string) {
  return !!target && /^(https?:|mailto:|tel:)/.test(target);
}

export function Nav({
  companyName = 'DNR Techno Services',
  logo = '/logo-dnr.png',
  headerCtaLabel = 'Talk to an Expert',
  headerCtaTarget = '#contact',
}: NavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setOpen(false);
  }

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith('#')) {
      closeMenu();
      return;
    }

    if (pathname !== '/') {
      closeMenu();
      return;
    }

    event.preventDefault();
    closeMenu();
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const resolveHref = (href: string) => (href.startsWith('#') && pathname !== '/' ? `/${href}` : href);
  const ctaExternal = isExternalTarget(headerCtaTarget);

  return (
    <header className="sticky top-0 z-40 border-b border-secondary/10 bg-white/98 text-secondary shadow-md shadow-secondary/10 backdrop-blur-xl">
      <div className="container-wide flex items-center justify-between gap-6 px-2 py-8 md:px-0">
          <Link href={resolveHref('#hero')} className="flex items-center gap-4 text-4xl font-bold leading-none tracking-tight text-secondary" onClick={(event) => handleAnchorClick(event, '#hero')}>
          <div className="relative min-h-[72px] min-w-[72px] h-18 w-18">
            <Image src={logo} alt={`${companyName} logo`} fill className="object-contain" priority />
          </div>
          <span className="text-secondary">{companyName}</span>
        </Link>

        <nav className="hidden gap-9 text-base font-medium text-secondary md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              onClick={(event) => handleAnchorClick(event, link.href)}
              className="rounded-md px-1 py-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {ctaExternal ? (
            <a
              href={headerCtaTarget}
              className="hidden md:inline-flex btn-primary text-base shadow-md"
              target={headerCtaTarget.startsWith('http') ? '_blank' : undefined}
              rel={headerCtaTarget.startsWith('http') ? 'noreferrer' : undefined}
            >
              {headerCtaLabel}
            </a>
          ) : (
            <Link href={resolveHref(headerCtaTarget)} className="hidden md:inline-flex btn-primary text-base shadow-md" prefetch={false} onClick={(event) => handleAnchorClick(event, headerCtaTarget)}>
              {headerCtaLabel}
            </Link>
          )}
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <div className="mb-1 h-0.5 w-6 bg-secondary" />
            <div className="mb-1 h-0.5 w-6 bg-secondary" />
            <div className="h-0.5 w-6 bg-secondary" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-secondary/10 bg-white/95 shadow-sm backdrop-blur md:hidden">
          <div className="container-wide flex flex-col gap-3 py-4 text-sm text-secondary">
            {links.map((link) => (
              <Link key={link.href} href={resolveHref(link.href)} className="py-2" onClick={(event) => handleAnchorClick(event, link.href)}>
                {link.label}
              </Link>
            ))}
            {ctaExternal ? (
              <a
                href={headerCtaTarget}
                className="py-2 font-semibold text-primary"
                onClick={closeMenu}
                target={headerCtaTarget.startsWith('http') ? '_blank' : undefined}
                rel={headerCtaTarget.startsWith('http') ? 'noreferrer' : undefined}
              >
                {headerCtaLabel}
              </a>
            ) : (
              <Link href={resolveHref(headerCtaTarget)} className="py-2 font-semibold text-primary" onClick={(event) => handleAnchorClick(event, headerCtaTarget)}>
                {headerCtaLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
