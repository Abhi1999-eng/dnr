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
    <header className="sticky top-0 z-40 border-b border-secondary/10 bg-white/88 text-secondary shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="container-wide flex items-center justify-between gap-6 py-6">
        <Link href={resolveHref('#hero')} className="group flex items-center gap-4 text-4xl font-bold leading-none tracking-tight text-secondary" onClick={(event) => handleAnchorClick(event, '#hero')}>
          <div className="relative h-18 w-18 min-h-[72px] min-w-[72px] transition-transform duration-300 group-hover:scale-[1.02]">
            <Image src={logo} alt={`${companyName} logo`} fill className="object-contain" priority />
          </div>
          <div className="space-y-1">
            <span className="block text-[2.05rem] text-secondary">{companyName}</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-secondary/45 lg:block">Industrial machinery and support</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 rounded-full border border-secondary/10 bg-white/70 px-3 py-2 text-base font-medium text-secondary shadow-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              onClick={(event) => handleAnchorClick(event, link.href)}
              className="rounded-full px-4 py-2 transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {ctaExternal ? (
            <a
              href={headerCtaTarget}
              className="hidden md:inline-flex btn-primary text-base shadow-lg"
              target={headerCtaTarget.startsWith('http') ? '_blank' : undefined}
              rel={headerCtaTarget.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {headerCtaLabel}
            </a>
          ) : (
            <Link href={resolveHref(headerCtaTarget)} className="hidden md:inline-flex btn-primary text-base shadow-lg" prefetch={false} onClick={(event) => handleAnchorClick(event, headerCtaTarget)}>
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
                rel={headerCtaTarget.startsWith('http') ? 'noopener noreferrer' : undefined}
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
