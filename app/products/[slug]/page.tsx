import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { InquiryForm } from '@/components/InquiryForm';
import { DescriptionBlock } from '@/components/DescriptionBlock';
import { SiteSettings } from '@/models/SiteSettings';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { resolveContactActionHref } from '@/lib/contact-actions';

export const dynamic = 'force-dynamic';

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const productDoc = await Product.findOne({ slug }).lean();
  if (!productDoc) return notFound();

  const product: any = productDoc;
  const related = await Product.find({ _id: { $ne: product._id } }).sort({ createdAt: -1 }).limit(3).lean();
  const settings: any = await SiteSettings.findOne().lean();
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
      <div className="container-wide space-y-10 py-14">
        <div className="grid items-start gap-10 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <p className="pill inline-flex">Product</p>
            <h1 className="text-4xl font-semibold">{product.title}</h1>
            <DescriptionBlock content={product.description || product.shortDescription || ''} maxPreview={260} />
            <div className="grid gap-4">
              {product.features?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Features</h3>
                  <ul className="list-disc space-y-1 pl-5 text-secondary/80">
                    {product.features.map((feature: string) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {product.applications?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((application: string) => (
                      <span key={application} className="rounded-full border border-muted/80 bg-muted/60 px-3 py-2 text-sm">
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {product.specs?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Specifications</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {product.specs.map((spec: any, idx: number) => (
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
            <div className="relative overflow-hidden rounded-2xl border border-muted/80 bg-white">
              <Image
                src={product.heroImage || product.image || '/dnr/page_06.png'}
                alt={product.title}
                width={960}
                height={540}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            {product.gallery?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {product.gallery.map((img: string) => (
                  <div key={img} className="relative h-28 overflow-hidden rounded-xl border border-muted/80">
                    <Image src={img} alt={product.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass space-y-3 rounded-2xl border border-accent/40 bg-white p-6">
          <h3 className="text-xl font-semibold text-secondary">Request a quote</h3>
          <InquiryForm config={settings?.inquiryForm} />
        </div>

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
