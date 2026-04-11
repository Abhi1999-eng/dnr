import Link from 'next/link';
import { fetchPublicData } from '@/lib/data';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const { products } = await fetchPublicData();

  return (
    <div className="min-h-screen bg-background text-secondary">
      <div className="container-wide py-16 space-y-10">
        <div className="space-y-3">
          <p className="pill inline-flex">Products</p>
          <h1 className="text-4xl font-semibold">Machinery & solutions</h1>
          <p className="text-secondary/80 max-w-3xl">Modern casting, machining, marking, polishing, and testing equipment for OEMs and high-uptime plants.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products?.map((p: any) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="glass border border-accent/30 bg-white rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition"
            >
              {p.heroImage && (
                <div className="relative w-full overflow-hidden rounded-xl bg-muted/60 border border-muted/80">
                  <Image src={p.heroImage} alt={p.title} width={640} height={360} className="h-40 w-full object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-secondary/70">{p.category?.name}</p>
                <h3 className="text-lg font-semibold text-secondary">{p.title}</h3>
                <p className="text-sm text-secondary/80 line-clamp-3">{p.shortDescription}</p>
              </div>
              <span className="text-sm font-semibold text-primary">View details →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
