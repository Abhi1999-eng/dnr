import Link from 'next/link';
import { SectionTitle } from './SectionTitle';
import { ContentCarousel } from './ContentCarousel';
import { ManagedImage } from './ManagedImage';
import { resolveServiceImage } from '@/lib/media';

export type ServiceType = {
  _id?: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  slug?: string;
};

export function ServiceGrid({
  services,
  id,
  title = 'Precision services for critical assets',
  kicker = 'Predictive maintenance, thermal diagnostics, vibration and ultrasound monitoring, energy audits, and complete reliability engineering delivered on-site or remote.',
}: {
  services: ServiceType[];
  id?: string;
  title?: string;
  kicker?: string;
}) {
  if (!services.length) return null;

  return (
    <section id={id} className="container-wide scroll-mt-28 mt-16 space-y-8">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, wide: 3 }}>
        {services.map((service) => {
          const imgSrc = resolveServiceImage(service);
          const href = service.slug ? `/services/${service.slug}` : '/services';
          return (
            <Link
              key={service._id || service.slug || service.title}
              href={href}
              className="glass group flex flex-col gap-4 rounded-[26px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(247,249,251,0.97))] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_24px_54px_rgba(15,23,42,0.13)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-secondary/10 bg-muted/40">
                <ManagedImage
                  src={imgSrc}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/18 via-transparent to-transparent" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-secondary">{service.title}</h3>
                <p className="text-secondary/80 text-sm leading-relaxed line-clamp-3">{service.description}</p>
              </div>
              <div className="flex items-center justify-between border-t border-secondary/10 pt-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/75">Service detail</span>
                <div className="text-sm font-semibold text-secondary transition group-hover:translate-x-1 group-hover:text-primary">Learn more →</div>
              </div>
            </Link>
          );
        })}
      </ContentCarousel>
    </section>
  );
}
