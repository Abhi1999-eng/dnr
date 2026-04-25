import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Admin',
  description: 'Administrative interface for managing DNR Techno Services website content.',
  path: '/admin',
  noIndex: true,
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
