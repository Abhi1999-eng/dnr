import Image from 'next/image';
import { SectionTitle } from './SectionTitle';

export type ServiceType = {
  _id?: string;
  title: string;
  description: string;
  image?: string;
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
  return (
    <section id={id} className="container-wide scroll-mt-28 mt-16 space-y-8">
      <SectionTitle title={title} kicker={kicker} />
      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => {
          const imgSrc = service.image || '/dnr/page_21.png';
          return (
            <div
              key={service.title}
              className="glass p-5 rounded-2xl card-hover border border-secondary/10 flex flex-col gap-4 bg-white shadow-lg shadow-secondary/10"
            >
              <div className="relative w-full overflow-hidden rounded-xl border border-secondary/10 bg-muted/40 aspect-[4/3]">
                <Image
                  src={imgSrc}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-secondary">{service.title}</h3>
                <p className="text-secondary/80 text-sm leading-relaxed line-clamp-3">{service.description}</p>
              </div>
              <div className="text-sm font-semibold text-primary hover:underline">Learn more →</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
