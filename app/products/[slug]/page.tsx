import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InquirySection } from '@/components/InquirySection';
import { DescriptionBlock } from '@/components/DescriptionBlock';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ProductDetailGallery } from '@/components/ProductDetailGallery';
import { ProductEnquiryActions } from '@/components/ProductEnquiryActions';
import { StructuredData } from '@/components/StructuredData';
import { resolveContactActionHref } from '@/lib/contact-actions';
import { fetchLiveProducts, fetchProductBySlug, fetchPublicData, fetchRelatedProducts } from '@/lib/data';
import { resolveMediaUrl, resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, buildProductJsonLd, createPageMetadata } from '@/lib/seo';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

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
  const whatsappNumber = siteSettings.whatsappNumber || primaryPhone || '+919711196735';
  const email = siteSettings.email || 'dnr.techservices@gmail.com';
  const quickLinks = (siteSettings.contactQuickLinks || []).filter((item: any) => item.active !== false).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const headerCtaHref = resolveContactActionHref(siteSettings.headerCtaActionType, siteSettings.headerCtaValue || siteSettings.headerCtaTarget, '#quote');
  const shortDescription = String(productData.shortDescription || '').trim();
  const longDescription = String(productData.description || '').trim();
  const videoEmbedUrl = getYouTubeEmbedUrl(productData.youtubeUrl || '');
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
        <Link href="/products" className="inline-flex text-sm font-semibold text-[#7ed321] transition hover:text-[#d5f4a8]">
          ← Back to products
        </Link>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] xl:gap-10">
          <div className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_24px_54px_rgba(0,0,0,0.3)] md:p-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Product</p>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-white md:text-4xl lg:text-5xl">{productData.title}</h1>
                <DescriptionBlock content={shortDescription} maxPreview={320} theme="dark" />
              </div>
            </div>

            {keyPoints.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {keyPoints.map((point) => (
                  <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200">
                    {point}
                  </div>
                ))}
              </div>
            ) : null}

            <ProductEnquiryActions
              productName={productData.title}
              productSlug={productData.slug}
              productUrl={`/products/${productData.slug}`}
              quickLinks={quickLinks}
              fallbackPhone={primaryPhone || '+919711196735'}
              fallbackWhatsapp={whatsappNumber}
              fallbackEmail={email}
              theme="dark"
            />

            <div className="grid gap-4">
              {productData.features?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Features</h3>
                  <ul className="list-disc space-y-1 pl-5 text-slate-300">
                    {productData.features.map((feature: string) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {productData.applications?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.applications.map((application: string) => (
                      <span key={application} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {productData.specs?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Specifications</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {productData.specs.map((spec: any, idx: number) => (
                      <div key={`${spec.label}-${idx}`} className="flex justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                        <span>{spec.label}</span>
                        <span className="font-semibold text-white">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <ProductDetailGallery
            theme="dark"
            title={productData.title}
            heroImage={resolveProductImage(productData)}
            galleryImages={(productData.gallery || []).map((img: string) => resolveMediaUrl(img, '/dnr/page_06.png'))}
          />
        </div>

        {videoEmbedUrl ? (
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.28)] md:p-6 lg:p-7">
            <div className="space-y-1 mb-4 md:mb-5">
              <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Product video</p>
              <h2 className="text-2xl font-semibold text-white">Product Video</h2>
              <p className="text-sm text-slate-300">Watch this machine video directly on the website.</p>
            </div>
            <div className="mx-auto mt-5 w-full max-w-[860px]">
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
                <iframe
                  src={videoEmbedUrl}
                  title={`${productData.title} video`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        ) : null}

        {longDescription ? (
          <section className="space-y-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
            <div className="space-y-1">
              <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Overview</p>
              <h2 className="text-2xl font-semibold text-white">Product Details</h2>
            </div>
            <div className="max-w-4xl whitespace-pre-line text-base leading-8 text-slate-300">{longDescription}</div>
          </section>
        ) : null}

        <InquirySection
          theme="dark"
          id="quote"
          kicker="Quote request"
          heading="Request a Quote"
          description={`Interested in ${productData.title}? Share your details and our team will contact you.`}
          formTitle="Share your requirement"
          config={siteSettings.inquiryForm}
          initialProductInterest={productData.title}
          formContext={{ pageType: 'product', productTitle: productData.title, productUrl: `/products/${productData.slug}` }}
          quickLinks={quickLinks}
          fallbackPhone={primaryPhone || '+919711196735'}
          fallbackEmail={email}
          fallbackWhatsapp={whatsappNumber}
        />

        {related.length ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">More products</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item: any) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-4 transition hover:-translate-y-1 hover:border-[#7ed321]/35 hover:shadow-[0_20px_46px_rgba(0,0,0,0.28)]"
                >
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.shortDescription || item.description || 'View product details'}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
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
