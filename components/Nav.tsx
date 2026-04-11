'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#categories', label: 'Products' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-secondary/10 bg-white/98 text-secondary shadow-md shadow-secondary/10">
      <div className="container-wide flex items-center justify-between py-8 px-2 md:px-0 gap-6">
        <Link href="#hero" className="flex items-center gap-4 text-4xl font-bold tracking-tight text-secondary leading-none">
          <div className="relative h-18 w-18 min-h-[72px] min-w-[72px]">
            <Image src="/logo-dnr.png" alt="DNR Techno Services logo" fill className="object-contain" priority />
          </div>
          <span className="text-secondary">DNR Techno</span>
        </Link>
        <nav className="hidden md:flex gap-9 text-base font-medium text-secondary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors px-1 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="#contact" className="hidden md:inline-flex btn-primary text-base shadow-md" prefetch={false}>
            Talk to an Expert
          </Link>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            <div className="w-6 h-0.5 bg-secondary mb-1" />
            <div className="w-6 h-0.5 bg-secondary mb-1" />
            <div className="w-6 h-0.5 bg-secondary" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-secondary/10 bg-white/95 backdrop-blur shadow-sm">
          <div className="container-wide py-4 flex flex-col gap-3 text-sm text-secondary">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="py-2" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="#contact" className="py-2 font-semibold text-primary" onClick={() => setOpen(false)}>
              Talk to an Expert
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
