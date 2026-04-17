import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { products, settings } = await fetchPublicData();
  const companyName = settings?.companyName || 'DNR Techno Services';
  const logo = settings?.logo || '/logo-dnr.png';
  const primaryPhone = settings?.primaryPhone || settings?.phone?.[0] || '';
  const secondaryPhone = settings?.secondaryPhone || settings?.phone?.[1] || '';

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={settings?.headerCtaTarget || '#contact'}
      />
      <div className="container-wide space-y-10 py-16">
        <div className="space-y-3">
          <p className="pill inline-flex">Products</p>
          <h1 className="text-4xl font-semibold">Machinery & solutions</h1>
          <p className="max-w-3xl text-secondary/80">Modern casting, machining, marking, polishing, and testing equipment for OEMs and high-uptime plants.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products?.map((p: any) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="glass flex flex-col gap-3 rounded-2xl border border-accent/30 bg-white p-5 transition hover:-translate-y-1">
              {p.heroImage && (
                <div className="relative w-full overflow-hidden rounded-xl border border-muted/80 bg-muted/60">
                  <Image src={p.heroImage} alt={p.title} width={640} height={360} className="h-40 w-full object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-secondary/70">{p.category?.name}</p>
                <h3 className="text-lg font-semibold text-secondary">{p.title}</h3>
                <p className="line-clamp-3 text-sm text-secondary/80">{p.shortDescription}</p>
              </div>
              <span className="text-sm font-semibold text-primary">View details →</span>
            </Link>
          ))}
        </div>
      </div>
      <Footer
        companyName={companyName}
        footerDescription={settings?.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={settings?.email}
        address={settings?.address}
        website={settings?.website}
        footerLinks={settings?.footerLinks}
      />
    </div>
  );
}
