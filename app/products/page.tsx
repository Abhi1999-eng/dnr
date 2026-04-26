import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { ManagedImage } from '@/components/ManagedImage';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchPublicData } from '@/lib/data';
import { resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { products } = await fetchPublicData();
  return createPageMetadata({
    title: 'Products',
    description:
      products?.[0]?.shortDescription ||
      'Browse industrial machinery and product solutions from DNR Techno Services for casting, machining, testing, and fabrication environments.',
    path: '/products',
    image: resolveProductImage(products?.[0]),
  });
}

export default async function ProductsPage() {
  const { products, settings } = await fetchPublicData();
  const siteSettings: any = settings || {};
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#contact');
  const structuredData = buildBreadcrumbJsonLd([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Products', url: absoluteUrl('/products') },
  ]);

  return (
    <div className="min-h-screen bg-background text-secondary">
      <StructuredData data={structuredData} />
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Talk to an Expert'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
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
              const imageSrc = resolveProductImage(product);
              return (
                <Link key={product.slug} href={`/products/${product.slug}`} className="glass flex flex-col gap-4 rounded-2xl border border-accent/30 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-muted/80 bg-muted/60">
                    <ManagedImage src={imageSrc} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-secondary">{product.title}</h3>
                    <p className="line-clamp-3 text-sm text-secondary/80">{product.shortDescription || product.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-secondary">View details →</span>
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
        footerDescription={siteSettings.footerDescription}
        phoneNumbers={[primaryPhone, secondaryPhone].filter(Boolean)}
        email={siteSettings.email}
        address={siteSettings.address}
        website={siteSettings.website}
        footerLinks={siteSettings.footerLinks}
      />
    </div>
  );
}
