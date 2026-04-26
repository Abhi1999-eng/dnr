'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { MouseEvent, useMemo, useState } from 'react';
import type { ProductType } from '@/types';

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
] as const;

type NavProps = {
  companyName?: string;
  logo?: string;
  headerCtaLabel?: string;
  headerCtaTarget?: string;
  products?: Pick<ProductType, 'title' | 'slug'>[];
};

function isExternalTarget(target?: string) {
  return !!target && /^(https?:|mailto:|tel:)/.test(target);
}

export function Nav({
  companyName = 'DNR Techno Services',
  logo = '/logo-dnr.png',
  headerCtaLabel = 'Talk to an Expert',
  headerCtaTarget = '#contact',
  products = [],
}: NavProps) {
  const [open, setOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const navProducts = useMemo(
    () =>
      (products || [])
        .filter((product): product is Pick<ProductType, 'title' | 'slug'> => Boolean(product?.slug && product?.title))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [products]
  );

  function closeMenu() {
    setOpen(false);
    setMobileProductsOpen(false);
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
    <header className="sticky top-0 z-[120] border-b border-slate-200 bg-white text-secondary shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="container-wide flex items-center justify-between gap-6 py-6">
        <Link href={resolveHref('#hero')} className="group flex items-center gap-4 text-4xl font-bold leading-none tracking-tight text-secondary" onClick={(event) => handleAnchorClick(event, '#hero')}>
          <div className="relative h-18 w-18 min-h-[72px] min-w-[72px] transition-transform duration-300 group-hover:scale-[1.02]">
            <Image src={logo} alt={`${companyName} logo`} fill className="object-contain" priority />
          </div>
          <div className="space-y-1">
            <span className="block text-[2.05rem] text-secondary">{companyName}</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-secondary/75 lg:block">Industrial machinery and support</span>
          </div>
        </Link>

        <nav className="relative isolate hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-base font-medium text-secondary shadow-sm md:flex">
          <div className="group/products relative overflow-visible">
            <Link
              href={resolveHref('#products')}
              onClick={(event) => handleAnchorClick(event, '#products')}
              className="touch-target inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <span>Products</span>
              {navProducts.length ? <ChevronDown size={16} className="transition-transform duration-200 group-hover/products:rotate-180 group-focus-within/products:rotate-180" aria-hidden="true" /> : null}
            </Link>

            {navProducts.length ? (
              <div className="pointer-events-none invisible absolute left-0 top-full z-[9999] w-[340px] origin-top pt-3 opacity-0 transition duration-200 group-hover/products:pointer-events-auto group-hover/products:visible group-hover/products:opacity-100 group-focus-within/products:pointer-events-auto group-focus-within/products:visible group-focus-within/products:opacity-100">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
                  <div className="mb-2 px-3 pb-2">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Product range</p>
                  </div>
                  <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
                    {navProducts.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        className="flex min-h-12 items-center rounded-2xl px-3 py-3 text-sm font-medium leading-snug text-slate-900 transition hover:bg-lime-50 hover:text-lime-700 focus-visible:bg-lime-50 focus-visible:text-lime-700 focus-visible:outline-none"
                      >
                        {product.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {links.map((link) => (
            <Link
              key={link.href}
              href={resolveHref(link.href)}
              onClick={(event) => handleAnchorClick(event, link.href)}
              className="touch-target rounded-full px-4 py-2 transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
          <button className="touch-target md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <div className="mb-1 h-0.5 w-6 bg-secondary" />
            <div className="mb-1 h-0.5 w-6 bg-secondary" />
            <div className="h-0.5 w-6 bg-secondary" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white shadow-sm md:hidden">
          <div className="container-wide flex flex-col gap-3 py-4 text-sm text-secondary">
            <Link href={resolveHref('#hero')} className="py-2" onClick={(event) => handleAnchorClick(event, '#hero')}>
              <span className="touch-target inline-flex items-center">Home</span>
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white px-1 py-1">
              <div className="flex items-center justify-between gap-3">
                <Link href={resolveHref('#products')} className="flex-1 py-2 pl-3" onClick={(event) => handleAnchorClick(event, '#products')}>
                  <span className="touch-target inline-flex items-center font-medium">Products</span>
                </Link>
                {navProducts.length ? (
                  <button
                    type="button"
                    className="touch-target inline-flex items-center justify-center rounded-full px-3 text-secondary transition hover:bg-primary/10 hover:text-primary"
                    aria-label={mobileProductsOpen ? 'Collapse product links' : 'Expand product links'}
                    aria-expanded={mobileProductsOpen}
                    onClick={() => setMobileProductsOpen((value) => !value)}
                  >
                    <ChevronDown size={18} className={`transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {mobileProductsOpen && navProducts.length ? (
                <div className="space-y-1 border-t border-secondary/10 px-2 pb-2 pt-2">
                  {navProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className="flex min-h-12 items-center rounded-xl px-3 py-2 text-secondary/85 transition hover:bg-primary/8 hover:text-primary"
                      onClick={closeMenu}
                    >
                      {product.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {links.map((link) => (
              <Link key={link.href} href={resolveHref(link.href)} className="py-2" onClick={(event) => handleAnchorClick(event, link.href)}>
                <span className="touch-target inline-flex items-center">{link.label}</span>
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
