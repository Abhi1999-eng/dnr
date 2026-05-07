import Link from 'next/link';
import { SectionTitle } from './SectionTitle';
import { ContentCarousel } from './ContentCarousel';
import { ManagedImage } from './ManagedImage';
import { Reveal } from './Reveal';
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
    <section id={id} className="container-wide mt-10 scroll-mt-24 space-y-5 md:mt-12">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 3 }} gapRem={1.25}>
        {services.map((service, index) => {
          const imgSrc = resolveServiceImage(service);
          const href = service.slug ? `/services/${service.slug}` : '/services';
          return (
            <Reveal key={service._id || service.slug || service.title} delay={index * 0.06} className="h-full">
              <Link
                href={href}
                className="group flex h-full min-h-[390px] flex-col gap-3 rounded-[24px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(247,249,251,0.97))] p-4 shadow-[0_14px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] md:min-h-[410px] md:p-5"
              >
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-[18px] border border-secondary/10 bg-slate-50 p-4 md:h-44">
                  <ManagedImage
                    src={imgSrc}
                    alt={service.title}
                    fill
                    className="object-contain object-center p-4 transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold leading-snug text-secondary">{service.title}</h3>
                  <p className="line-clamp-2 text-sm leading-6 text-secondary/75">{service.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-secondary/10 pt-4 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary/75">Service detail</span>
                  <div className="text-sm font-semibold text-secondary transition group-hover:translate-x-1 group-hover:text-primary">Learn more →</div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ContentCarousel>
    </section>
  );
}
