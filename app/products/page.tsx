import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { products, settings } = await fetchPublicData();
  const companyName = settings?.companyName || 'DNR Techno Services';
  const logo = settings?.logo || '/logo-dnr.png';
  const primaryPhone = settings?.primaryPhone || settings?.phone?.[0] || '';
  const secondaryPhone = settings?.secondaryPhone || settings?.phone?.[1] || '';
  const headerCtaHref = resolveContactActionHref(settings?.headerCtaActionType, settings?.headerCtaValue || settings?.headerCtaTarget, '#contact');

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={settings?.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
      />
      <div className="container-wide space-y-10 py-16">
        <div className="space-y-3">
          <p className="pill inline-flex">Products</p>
          <h1 className="text-4xl font-semibold">Machinery & solutions</h1>
          <p className="max-w-3xl text-secondary/80">Browse the products DNR has added to the site. Every product in the admin panel appears here automatically.</p>
        </div>

        {products?.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product: any) => {
              const imageSrc = product.heroImage || product.image || '/dnr/page_06.png';
              return (
                <Link key={product.slug} href={`/products/${product.slug}`} className="glass flex flex-col gap-4 rounded-2xl border border-accent/30 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-muted/80 bg-muted/60">
                    <Image src={imageSrc} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-secondary">{product.title}</h3>
                    <p className="line-clamp-3 text-sm text-secondary/80">{product.shortDescription || product.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">View details →</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-secondary/20 bg-white/80 px-6 py-14 text-center">
            <h2 className="text-2xl font-semibold text-secondary">No products added yet</h2>
            <p className="mt-2 text-sm text-secondary/70">Add products from the admin panel and they will appear here automatically.</p>
          </div>
        )}
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
