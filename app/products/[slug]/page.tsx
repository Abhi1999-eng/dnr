import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { InquiryForm } from '@/components/InquiryForm';
import { DescriptionBlock } from '@/components/DescriptionBlock';
import { SiteSettings } from '@/models/SiteSettings';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';

export const dynamic = 'force-dynamic';

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await params;
  const productDoc = await Product.findOne({ slug, published: true }).populate('category').lean();
  if (!productDoc) return notFound();
  const product: any = productDoc;
  const related = await Product.find({ category: product.category?._id, _id: { $ne: product._id }, published: true }).limit(3).lean();
  const category: any = product.category ? await Category.findById(product.category).lean() : null;
  const settings: any = await SiteSettings.findOne().lean();
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
      <div className="container-wide py-14 space-y-10">
        <div className="grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-start">
          <div className="space-y-6">
            <p className="pill inline-flex">{category?.name || 'Product'}</p>
            <h1 className="text-4xl font-semibold">{product.title}</h1>
            <DescriptionBlock content={product.description || product.shortDescription || ''} maxPreview={260} />
            <div className="grid gap-4">
              {product.features?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Features</h3>
                  <ul className="list-disc list-inside text-secondary/80 space-y-1">
                    {product.features.map((f: string) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {product.applications?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Applications</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((a: string) => (
                      <span key={a} className="px-3 py-2 rounded-full bg-muted/60 border border-muted/80 text-sm">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {product.specs?.length ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-secondary">Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {product.specs.map((s: any, idx: number) => (
                      <div key={idx} className="flex justify-between bg-white border border-muted/70 rounded-lg px-3 py-2 text-sm">
                        <span>{s.label}</span>
                        <span className="font-semibold text-secondary">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            {product.heroImage && (
              <div className="relative overflow-hidden rounded-2xl bg-white border border-muted/80">
                <Image src={product.heroImage} alt={product.title} width={960} height={540} className="w-full h-auto object-cover" priority />
              </div>
            )}
            {product.gallery?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {product.gallery.map((img: string) => (
                  <div key={img} className="relative h-28 rounded-xl overflow-hidden border border-muted/80">
                    <Image src={img} alt={product.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass bg-white rounded-2xl border border-accent/40 p-6 space-y-3">
          <h3 className="text-xl font-semibold text-secondary">Request a quote</h3>
          <InquiryForm config={settings?.inquiryForm} />
        </div>

        {related.length ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-secondary">Related products</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r: any) => (
                <Link key={r.slug} href={`/products/${r.slug}`} className="glass bg-white border border-muted/80 rounded-xl p-4 hover:-translate-y-1 transition">
                  <p className="text-sm text-secondary/70">{category?.name}</p>
                  <p className="font-semibold text-secondary">{r.title}</p>
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
