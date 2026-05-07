import Link from 'next/link';
import { SectionTitle } from './SectionTitle';
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((service, index) => {
          const imgSrc = resolveServiceImage(service);
          const href = service.slug ? `/services/${service.slug}` : '/services';
          return (
            <Reveal key={service._id || service.slug || service.title} delay={index * 0.05} className="h-full">
              <Link
                href={href}
                className="group flex min-h-[230px] h-full flex-col rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_36px_rgba(15,23,42,0.10)]"
              >
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 md:h-[72px] md:w-[72px]">
                  <ManagedImage
                    src={imgSrc}
                    alt={service.title}
                    fill
                    className="object-contain object-center p-2"
                    sizes="72px"
                  />
                </div>

                <div className="mt-5 space-y-2">
                  <h3 className="text-base font-semibold leading-snug text-slate-900">{service.title}</h3>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-600">{service.description}</p>
                </div>

                <div className="mt-auto pt-4 text-sm font-semibold text-slate-900 transition group-hover:text-lime-600">
                  Learn more →
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
