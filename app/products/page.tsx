import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { ManagedImage } from '@/components/ManagedImage';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchPublicData } from '@/lib/data';
import { resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const products = await fetchLiveProducts();
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
  const [{ settings }, products] = await Promise.all([fetchPublicData(), fetchLiveProducts()]);
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
    <div className="min-h-screen bg-[#071014] text-white">
      <StructuredData data={structuredData} />
      <Nav
        companyName={companyName}
        logo={logo}
        headerCtaLabel={siteSettings.headerCtaLabel || 'Get in Touch'}
        headerCtaTarget={headerCtaHref}
        products={products || []}
        theme="dark"
      />
      <div className="container-wide space-y-8 py-12 md:py-14">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.94),rgba(10,16,20,0.98))] p-6 shadow-[0_20px_48px_rgba(0,0,0,0.26)] md:p-8">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Products</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Machinery &amp; solutions</h1>
            <p className="max-w-3xl text-slate-300">Browse the products DNR has added to the site. Every product in the admin panel appears here automatically.</p>
          </div>
        </div>

        {products?.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product: any) => {
              const imageSrc = resolveProductImage(product);
              return (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="group flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-4 shadow-[0_20px_44px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-[#7ed321]/35 hover:shadow-[0_24px_50px_rgba(0,0,0,0.32)]"
                >
                  <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1218] p-4 md:h-[240px]">
                    <ManagedImage src={imageSrc} alt={product.title} width={1200} height={900} className="h-full w-full object-contain object-center" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{product.title}</h3>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-300">{product.shortDescription || product.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#7ed321] transition group-hover:translate-x-1">View details →</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/12 bg-[#111b24] px-6 py-14 text-center shadow-[0_20px_44px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-semibold text-white">No products added yet</h2>
            <p className="mt-2 text-sm text-slate-400">Add products from the admin panel and they will appear here automatically.</p>
          </div>
        )}
      </div>
      <Footer
        theme="dark"
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
