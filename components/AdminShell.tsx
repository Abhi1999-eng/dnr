'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/homepage', label: 'Homepage' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/client-logos', label: 'Client Logos / Brands' },
  { href: '/admin/coverage', label: 'Coverage Settings' },
  { href: '/admin/contact', label: 'Contact Settings' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/media', label: 'Media' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-ui min-h-screen bg-[radial-gradient(circle_at_top,_rgba(139,197,63,0.08),_transparent_32%),linear-gradient(180deg,_#020617,_#0f172a)] text-slate-100">
      <div className="flex h-full">
        <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-950/80 p-6 backdrop-blur md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/80">DNR CMS</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Admin Panel</h2>
          <p className="mt-2 text-sm text-slate-400">Manage website content, contact settings, and business sections from one place.</p>
          <div className="mt-6 space-y-2 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-3 transition ${
                  pathname === item.href
                    ? 'bg-primary/15 text-white shadow-[inset_0_0_0_1px_rgba(139,197,63,0.35)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8 xl:p-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
