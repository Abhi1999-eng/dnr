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

    if (pathname !== '/' && href !== '#quote') {
      closeMenu();
      return;
    }

    event.preventDefault();
    closeMenu();
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const resolveHref = (href: string) => (href.startsWith('#') && pathname !== '/' && href !== '#quote' ? `/${href}` : href);
  const ctaExternal = isExternalTarget(headerCtaTarget);
  const ctaLabel = 'Get in Touch';

  return (
    <header className="sticky top-0 z-[120] border-b border-slate-200 bg-white text-secondary shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="container-wide flex items-center justify-between gap-4 py-4 md:gap-6 md:py-6 lg:grid lg:min-h-[128px] lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10 lg:py-7">
        <Link href={resolveHref('#hero')} className="group flex items-center text-secondary" onClick={(event) => handleAnchorClick(event, '#hero')}>
          <div className="relative h-16 w-[180px] transition-transform duration-300 group-hover:scale-[1.01] sm:h-20 sm:w-[240px] lg:h-24 lg:w-[340px] xl:w-[380px]">
            <Image src={logo} alt={`${companyName} logo`} fill className="object-contain object-left" priority />
          </div>
        </Link>

        <nav className="relative isolate hidden justify-self-start lg:ml-10 lg:flex lg:min-h-[68px] lg:items-center lg:gap-5 rounded-full border border-slate-200 bg-white px-8 py-3 text-[18px] font-medium text-secondary shadow-[0_10px_24px_rgba(15,23,42,0.05)] lg:px-11 xl:ml-14 xl:gap-7 xl:px-14 xl:text-[19px]">
          <div className="group/products relative overflow-visible">
            <Link
              href={resolveHref('#products')}
              onClick={(event) => handleAnchorClick(event, '#products')}
              className="touch-target inline-flex items-center gap-2 rounded-full px-4 py-2.5 transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
              className="touch-target rounded-full px-4 py-2.5 transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {ctaExternal ? (
            <a
              href={headerCtaTarget}
              className="hidden min-h-[64px] min-w-[190px] whitespace-nowrap rounded-2xl bg-[linear-gradient(120deg,#8bc53f,#79b535_68%,#6aa12f)] px-10 text-[18px] font-semibold text-[#15200d] shadow-[0_18px_40px_rgba(139,197,63,0.24)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(139,197,63,0.28)] lg:inline-flex"
              target={headerCtaTarget.startsWith('http') ? '_blank' : undefined}
              rel={headerCtaTarget.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={resolveHref(headerCtaTarget)}
              className="hidden min-h-[64px] min-w-[190px] items-center justify-center whitespace-nowrap rounded-2xl bg-[linear-gradient(120deg,#8bc53f,#79b535_68%,#6aa12f)] px-10 text-[18px] font-semibold text-[#15200d] shadow-[0_18px_40px_rgba(139,197,63,0.24)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(139,197,63,0.28)] lg:inline-flex"
              prefetch={false}
              onClick={(event) => handleAnchorClick(event, headerCtaTarget)}
            >
              {ctaLabel}
            </Link>
          )}
          <button className="touch-target lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <div className="mb-1 h-0.5 w-6 bg-secondary" />
            <div className="mb-1 h-0.5 w-6 bg-secondary" />
            <div className="h-0.5 w-6 bg-secondary" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white shadow-sm lg:hidden">
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
                {ctaLabel}
              </a>
            ) : (
              <Link href={resolveHref(headerCtaTarget)} className="py-2 font-semibold text-primary" onClick={(event) => handleAnchorClick(event, headerCtaTarget)}>
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
