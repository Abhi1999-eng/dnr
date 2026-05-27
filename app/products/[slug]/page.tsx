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
import { fetchLiveProducts, fetchProductBySlug, fetchPublicData, fetchRelatedBlogsByProduct, fetchRelatedProducts } from '@/lib/data';
import { resolveMediaUrl, resolveProductImage } from '@/lib/media';
import { absoluteUrl, buildBreadcrumbJsonLd, buildProductDetailSchema, createPageMetadata } from '@/lib/seo';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

export const revalidate = 300;

const supportPoints = [
  'Guidance on machine selection based on your process, output target, and plant constraints.',
  'Support for installation planning, commissioning coordination, and line integration.',
  'Help with service follow-up, spare parts continuity, and machine-side troubleshooting.',
];

const faqItems = [
  {
    question: 'How do I request a quote for this machine?',
    answer: 'Use the enquiry form or contact buttons on this page and share your process requirement, target output, and location so the DNR team can respond with the right next step.',
  },
  {
    question: 'Can DNR support installation and commissioning?',
    answer: 'Yes. DNR supports industrial buyers with installation planning, commissioning coordination, and plant-side execution support based on the machine and project scope.',
  },
  {
    question: 'Do you also help with service and spare parts after supply?',
    answer: 'Yes. DNR supports ongoing production needs through service coordination, technical response, and spare-parts continuity for applicable machines and systems.',
  },
];

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
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.shortDescription || product.description,
    path: `/products/${product.slug}`,
    image: resolveMediaUrl(product.seo?.ogImage || product.heroImage || product.image, '/dnr/page_06.png'),
  });
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productData: any = await fetchProductBySlug(slug);
  if (!productData) return notFound();

  const [{ settings }, products, related, relatedBlogs] = await Promise.all([
    fetchPublicData(),
    fetchLiveProducts(),
    fetchRelatedProducts(productData._id, 3),
    fetchRelatedBlogsByProduct(String(productData._id), 3),
  ]);
  const siteSettings: any = settings || {};
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
  const industries = Array.isArray(productData.applications) ? productData.applications.slice(0, 6) : [];
  const structuredData = [
    buildBreadcrumbJsonLd([
      { name: 'Home', url: absoluteUrl('/') },
      { name: 'Products', url: absoluteUrl('/products') },
      { name: productData.title, url: absoluteUrl(`/products/${productData.slug}`) },
    ]),
    buildProductDetailSchema(productData),
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
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-[#d5f4a8]">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="transition hover:text-[#d5f4a8]">Products</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-200">{productData.title}</span>
        </nav>

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
                <section className="space-y-2">
                  <h2 className="font-semibold text-white">Overview</h2>
                  <ul className="list-disc space-y-1 pl-5 text-slate-300">
                    {productData.features.map((feature: string) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {productData.applications?.length ? (
                <section className="space-y-2">
                  <h2 className="font-semibold text-white">Applications</h2>
                  <div className="flex flex-wrap gap-2">
                    {productData.applications.map((application: string) => (
                      <span key={application} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                        {application}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
              {productData.specs?.length ? (
                <section className="space-y-2">
                  <h2 className="font-semibold text-white">Specifications</h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    {productData.specs.map((spec: any, idx: number) => (
                      <div key={`${spec.label}-${idx}`} className="flex justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                        <span>{spec.label}</span>
                        <span className="font-semibold text-white">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
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
            <div className="mb-4 space-y-1 md:mb-5">
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
          {longDescription ? (
            <section className="space-y-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
              <div className="space-y-1">
                <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Overview</p>
                <h2 className="text-2xl font-semibold text-white">Product Details</h2>
              </div>
              <div className="max-w-4xl whitespace-pre-line text-base leading-8 text-slate-300">{longDescription}</div>
            </section>
          ) : null}

          <section className="space-y-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
            <div className="space-y-1">
              <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Use cases</p>
              <h2 className="text-2xl font-semibold text-white">Suitable Industries</h2>
            </div>
            {industries.length ? (
              <div className="flex flex-wrap gap-2">
                {industries.map((industry: string) => (
                  <span key={industry} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                    {industry}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-300">This machine is suited to industrial buyers comparing production needs, process stability, machine support, and long-term service continuity.</p>
            )}
          </section>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
          <div className="space-y-1">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Plant-side support</p>
            <h2 className="text-2xl font-semibold text-white">Support from DNR</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {supportPoints.map((point) => (
              <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                {point}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
          <div className="space-y-1">
            <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">FAQs</p>
            <h2 className="text-2xl font-semibold text-white">Common questions</h2>
          </div>
          <div className="mt-5 space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-base font-semibold text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

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

        {relatedBlogs.length ? (
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="inline-flex rounded-full border border-[#7ed321]/18 bg-[#7ed321]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d5f4a8]">Buying guidance</p>
              <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedBlogs.map((entry: any) => (
                <Link
                  key={entry.slug}
                  href={`/blog/${entry.slug}`}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,27,36,0.95),rgba(10,16,20,0.98))] p-4 transition hover:-translate-y-1 hover:border-[#7ed321]/35 hover:shadow-[0_20px_46px_rgba(0,0,0,0.28)]"
                >
                  <p className="font-semibold text-white">{entry.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{entry.excerpt || 'Read the full article for practical machine selection and support guidance.'}</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-[#7ed321]">Read article →</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Related Products</h2>
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
          </section>
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
