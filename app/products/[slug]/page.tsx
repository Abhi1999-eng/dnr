import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InquirySection } from '@/components/InquirySection';
import { ManagedImage } from '@/components/ManagedImage';
import { DescriptionBlock } from '@/components/DescriptionBlock';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchProductBySlug, fetchPublicData, fetchRelatedProducts } from '@/lib/data';
import { resolveMediaUrl, resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, buildProductJsonLd, createPageMetadata } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product: any = await fetchProductBySlug(slug);

  if (!product) {
    return createPageMetadata({
      title: 'Product not found',
      description: 'The requested product could not be found.',
      path: `/products/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: product.title,
    description: product.seo?.description || product.shortDescription || product.description,
    path: `/products/${product.slug}`,
    image: resolveMediaUrl(product.seo?.ogImage || product.heroImage || product.image, '/dnr/page_06.png'),
  });
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productData: any = await fetchProductBySlug(slug);
  if (!productData) return notFound();

  const [{ settings }, products] = await Promise.all([fetchPublicData(), fetchLiveProducts()]);
  const siteSettings: any = settings || {};
  const related = await fetchRelatedProducts(productData._id, 3);
  const companyName = siteSettings.companyName || 'DNR Techno Services';
  const logo = siteSettings.logo || '/logo-dnr.png';
  const primaryPhone = siteSettings.primaryPhone || siteSettings.phone?.[0] || '';
  const secondaryPhone = siteSettings.secondaryPhone || siteSettings.phone?.[1] || '';
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#quote');
  const shortDescription = String(productData.shortDescription || '').trim();
  const longDescription = String(productData.description || '').trim();
  const keyPoints = [
    productData.features?.length ? `${productData.features.length} feature${productData.features.length === 1 ? '' : 's'}` : '',
    productData.applications?.length ? `${productData.applications.length} application${productData.applications.length === 1 ? '' : 's'}` : '',
    productData.specs?.length ? `${productData.specs.length} specification${productData.specs.length === 1 ? '' : 's'}` : '',
  ].filter(Boolean);
  const structuredData = [
    buildBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Products', url: absoluteUrl('/products') },
      { name: productData.title, url: absoluteUrl(`/products/${productData.slug}`) },
    ]),
    buildProductJsonLd(productData),
  ];

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
      <div className="container-wide space-y-10 py-14">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:gap-10">
          <div className="space-y-6 rounded-[28px] border border-muted/70 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-4">
              <p className="pill inline-flex">Product</p>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold text-secondary">{productData.title}</h1>
                <DescriptionBlock content={shortDescription} maxPreview={320} />
              </div>
            </div>

            {keyPoints.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {keyPoints.map((point) => (
                  <div key={point} className="rounded-2xl border border-muted/80 bg-slate-50 px-4 py-3 text-sm font-medium text-secondary/80">
                    {point}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4">
              {productData.features?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Features</h3>
                  <ul className="list-disc space-y-1 pl-5 text-secondary/80">
                    {productData.features.map((feature: string) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {productData.applications?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.applications.map((application: string) => (
                      <span key={application} className="rounded-full border border-muted/80 bg-muted/60 px-3 py-2 text-sm">
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {productData.specs?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Specifications</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {productData.specs.map((spec: any, idx: number) => (
                      <div key={`${spec.label}-${idx}`} className="flex justify-between rounded-lg border border-muted/70 bg-white px-3 py-2 text-sm">
                        <span>{spec.label}</span>
                        <span className="font-semibold text-secondary">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-muted/80 bg-slate-50 p-4 md:aspect-[5/4] md:p-6">
              <ManagedImage
                src={resolveProductImage(productData)}
                alt={productData.title}
                width={1600}
                height={1200}
                className="max-h-full max-w-full object-contain object-center"
                priority
              />
            </div>
            {productData.gallery?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {productData.gallery.map((img: string, index: number) => (
                  <div key={`${img}-${index}`} className="relative h-28 overflow-hidden rounded-xl border border-muted/80 bg-white p-2">
                    <ManagedImage src={resolveMediaUrl(img, '/dnr/page_06.png')} alt={`${productData.title} gallery image ${index + 1}`} fill className="object-contain object-center p-2" sizes="(max-width: 768px) 33vw, 160px" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {longDescription ? (
          <section className="space-y-4 rounded-3xl border border-muted/80 bg-white p-6 shadow-sm">
            <div className="space-y-1">
              <p className="pill inline-flex">Overview</p>
              <h2 className="text-2xl font-semibold text-secondary">Product Details</h2>
            </div>
            <div className="max-w-4xl whitespace-pre-line text-base leading-8 text-secondary/80">{longDescription}</div>
          </section>
        ) : null}

        <InquirySection
          id="quote"
          kicker="Quote request"
          heading="Request a Quote"
          description={`Interested in ${productData.title}? Share your details and our team will contact you.`}
          formTitle="Share your requirement"
          config={siteSettings.inquiryForm}
          initialProductInterest={productData.title}
          formContext={{ pageType: 'product', productTitle: productData.title, productUrl: `/products/${productData.slug}` }}
          quickLinks={siteSettings.quickContactLinks}
          fallbackPhone={primaryPhone}
          fallbackEmail={siteSettings.email}
          fallbackWhatsapp={siteSettings.whatsappNumber}
        />

        {related.length ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary">More products</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item: any) => (
                <Link key={item.slug} href={`/products/${item.slug}`} className="glass rounded-xl border border-muted/80 bg-white p-4 transition hover:-translate-y-1">
                  <p className="font-semibold text-secondary">{item.title}</p>
                  <p className="mt-2 text-sm text-secondary/70">{item.shortDescription || item.description || 'View product details'}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
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
