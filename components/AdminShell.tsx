'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/homepage', label: 'Homepage' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/media', label: 'Media' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex h-full">
        <aside className="w-60 border-r border-white/10 p-5 sticky top-0 h-screen hidden md:block">
          <h2 className="text-lg font-semibold mb-6">Admin</h2>
          <div className="space-y-2 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg transition ${
                  pathname === item.href ? 'bg-white/10 text-white' : 'hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
