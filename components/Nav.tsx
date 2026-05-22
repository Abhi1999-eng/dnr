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
  theme?: 'light' | 'dark';
};

function isExternalTarget(target?: string) {
  return !!target && /^(https?:|mailto:|tel:)/.test(target);
}

export function Nav({
  companyName = 'DNR Techno Services',
  logo = '/logo-dnr.png',
  headerCtaTarget = '#contact',
  products = [],
  theme = 'light',
}: NavProps) {
  const [open, setOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const pathname = usePathname();
  const isDark = theme === 'dark';
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
  const logoSrc = isDark ? '/images/dnr-logo-white-transparent-clean.png' : logo;

  return (
    <header
      className={`sticky top-0 z-[120] border-b shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${
        isDark ? 'border-[#7ed321]/12 bg-[#071014]/90 text-white backdrop-blur-sm' : 'border-slate-200 bg-white text-secondary'
      }`}
    >
      <div className="container-wide flex items-center justify-between gap-4 py-4 sm:py-5 md:gap-6 md:py-6 lg:grid lg:min-h-[92px] lg:grid-cols-[250px_1fr_170px] lg:items-center lg:gap-4 lg:py-3.5">
        <Link href={resolveHref('#hero')} className={`group flex items-center ${isDark ? 'text-white' : 'text-secondary'}`} onClick={(event) => handleAnchorClick(event, '#hero')}>
          <div className="relative h-[70px] w-[220px] transition-transform duration-300 group-hover:scale-[1.01] sm:h-[76px] sm:w-[240px] lg:h-[82px] lg:w-[260px] xl:h-[88px] xl:w-[280px]">
            <Image
              src={logoSrc}
              alt={`${companyName} logo`}
              fill
              className="object-contain object-left drop-shadow-[0_2px_10px_rgba(126,211,33,0.16)]"
              sizes="(max-width: 640px) 220px, (max-width: 1024px) 240px, (max-width: 1280px) 260px, 280px"
              priority
            />
          </div>
        </Link>

        <nav
          className={`relative isolate hidden items-center gap-1 justify-self-center rounded-2xl border p-1.5 text-[15px] font-medium shadow-[0_12px_35px_rgba(0,0,0,0.18)] lg:flex ${
            isDark ? 'border-white/10 bg-white/[0.04] text-white' : 'border-slate-200 bg-white text-secondary shadow-[0_10px_24px_rgba(15,23,42,0.05)]'
          }`}
        >
          <div className="group/products relative overflow-visible">
            <Link
              href={resolveHref('#products')}
              onClick={(event) => handleAnchorClick(event, '#products')}
              className={`touch-target inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[15px] transition-all focus-visible:outline-none focus-visible:ring-2 ${
                isDark ? 'hover:bg-white/[0.07] hover:text-[#7ed321] focus-visible:ring-[#7ed321]/50' : 'hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/50'
              }`}
            >
              <span>Products</span>
              {navProducts.length ? <ChevronDown size={16} className="transition-transform duration-200 group-hover/products:rotate-180 group-focus-within/products:rotate-180" aria-hidden="true" /> : null}
            </Link>

            {navProducts.length ? (
              <div className="pointer-events-none invisible absolute left-0 top-full z-[9999] w-[340px] origin-top pt-3 opacity-0 transition duration-200 group-hover/products:pointer-events-auto group-hover/products:visible group-hover/products:opacity-100 group-focus-within/products:pointer-events-auto group-focus-within/products:visible group-focus-within/products:opacity-100">
                <div className={`overflow-hidden rounded-[28px] border p-3 shadow-[0_32px_80px_rgba(15,23,42,0.18)] ${isDark ? 'border-[#7ed321]/16 bg-[#111b24]' : 'border-slate-200 bg-white'}`}>
                  <div className="mb-2 px-3 pb-2">
                    <p className={isDark ? 'text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#d5f4a8]' : 'text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500'}>Product range</p>
                  </div>
                  <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
                    {navProducts.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        className={`flex min-h-11 items-center rounded-2xl px-3 py-2.5 text-sm font-medium leading-snug transition focus-visible:outline-none ${isDark ? 'text-white hover:bg-[#7ed321]/10 hover:text-[#7ed321] focus-visible:bg-[#7ed321]/10 focus-visible:text-[#7ed321]' : 'text-slate-900 hover:bg-lime-50 hover:text-lime-700 focus-visible:bg-lime-50 focus-visible:text-lime-700'}`}
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
              className={`touch-target rounded-xl px-5 py-3 text-[15px] transition-all focus-visible:outline-none focus-visible:ring-2 ${
                isDark ? 'hover:bg-white/[0.07] hover:text-[#7ed321] focus-visible:ring-[#7ed321]/50' : 'hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {ctaExternal ? (
            <a
              href={headerCtaTarget}
              className="hidden h-[52px] min-w-[168px] whitespace-nowrap rounded-xl bg-[linear-gradient(120deg,#8bc53f,#79b535_68%,#6aa12f)] px-7 text-[15px] font-semibold text-[#15200d] shadow-[0_14px_30px_rgba(139,197,63,0.22)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(139,197,63,0.26)] lg:inline-flex lg:items-center lg:justify-center lg:justify-self-end"
              target={headerCtaTarget.startsWith('http') ? '_blank' : undefined}
              rel={headerCtaTarget.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={resolveHref(headerCtaTarget)}
              className="hidden h-[52px] min-w-[168px] items-center justify-center whitespace-nowrap rounded-xl bg-[linear-gradient(120deg,#8bc53f,#79b535_68%,#6aa12f)] px-7 text-[15px] font-semibold text-[#15200d] shadow-[0_14px_30px_rgba(139,197,63,0.22)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(139,197,63,0.26)] lg:inline-flex lg:justify-self-end"
              prefetch={false}
              onClick={(event) => handleAnchorClick(event, headerCtaTarget)}
            >
              {ctaLabel}
            </Link>
          )}
          <button className="touch-target lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <div className={`mb-1 h-0.5 w-6 ${isDark ? 'bg-white' : 'bg-secondary'}`} />
            <div className={`mb-1 h-0.5 w-6 ${isDark ? 'bg-white' : 'bg-secondary'}`} />
            <div className={`h-0.5 w-6 ${isDark ? 'bg-white' : 'bg-secondary'}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className={`border-t shadow-sm lg:hidden ${isDark ? 'border-[#7ed321]/12 bg-[#0b1218]' : 'border-slate-200 bg-white'}`}>
          <div className={`container-wide flex flex-col gap-3 py-4 text-sm ${isDark ? 'text-white' : 'text-secondary'}`}>
            <Link href={resolveHref('#hero')} className="py-2" onClick={(event) => handleAnchorClick(event, '#hero')}>
              <span className="touch-target inline-flex items-center">Home</span>
            </Link>

            <div className={`rounded-2xl border px-1 py-1 ${isDark ? 'border-[#7ed321]/16 bg-[#111b24]' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between gap-3">
                <Link href={resolveHref('#products')} className="flex-1 py-2 pl-3" onClick={(event) => handleAnchorClick(event, '#products')}>
                  <span className="touch-target inline-flex items-center font-medium">Products</span>
                </Link>
                {navProducts.length ? (
                  <button
                    type="button"
                    className={`touch-target inline-flex items-center justify-center rounded-full px-3 transition ${isDark ? 'text-white hover:bg-[#7ed321]/10 hover:text-[#7ed321]' : 'text-secondary hover:bg-primary/10 hover:text-primary'}`}
                    aria-label={mobileProductsOpen ? 'Collapse product links' : 'Expand product links'}
                    aria-expanded={mobileProductsOpen}
                    onClick={() => setMobileProductsOpen((value) => !value)}
                  >
                    <ChevronDown size={18} className={`transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {mobileProductsOpen && navProducts.length ? (
                <div className={`space-y-1 border-t px-2 pb-2 pt-2 ${isDark ? 'border-white/8' : 'border-secondary/10'}`}>
                  {navProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className={`flex min-h-12 items-center rounded-xl px-3 py-2 transition ${isDark ? 'text-white/85 hover:bg-[#7ed321]/8 hover:text-[#7ed321]' : 'text-secondary/85 hover:bg-primary/8 hover:text-primary'}`}
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
                className={isDark ? 'py-2 font-semibold text-[#7ed321]' : 'py-2 font-semibold text-primary'}
                onClick={closeMenu}
                target={headerCtaTarget.startsWith('http') ? '_blank' : undefined}
                rel={headerCtaTarget.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {ctaLabel}
              </a>
            ) : (
              <Link href={resolveHref(headerCtaTarget)} className={isDark ? 'py-2 font-semibold text-[#7ed321]' : 'py-2 font-semibold text-primary'} onClick={(event) => handleAnchorClick(event, headerCtaTarget)}>
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
