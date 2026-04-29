import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Industrial Machinery and Engineering Support`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ['industrial machinery', 'cnc machines', 'foundry equipment', 'plant engineering support', 'DNR Techno Services'],
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} | Industrial Machinery and Engineering Support`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl('/logo-dnr.png'),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Industrial Machinery and Engineering Support`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl('/logo-dnr.png')],
  },
  verification: {
    google: 'WoE4_Bs_wryQrkbXrk0laWms2ez6G257TLP8gLVq-5w',
  },
  category: 'Industrial Machinery',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background font-sans text-secondary antialiased`}>
        {children}
      </body>
    </html>
  );
}
