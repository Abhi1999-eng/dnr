import Image from 'next/image';
import { SectionTitle } from './SectionTitle';
import { ClientLogoType } from '@/types';
import { ContentCarousel } from './ContentCarousel';

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ClientLogosSection({
  title = 'Associated Brands',
  kicker = 'Selected customer and brand relationships from DNR project materials.',
  logos,
}: {
  title?: string;
  kicker?: string;
  logos: ClientLogoType[];
}) {
  if (!logos.length) return null;

  return (
    <section id="clients" className="container-wide mt-16 space-y-8">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}>
        {logos.map((logo) => {
          const content = logo.logoImage ? (
            <div className="relative h-20 w-full grayscale transition duration-300 group-hover:grayscale-0">
              <Image src={logo.logoImage} alt={logo.name} fill className="object-contain" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
          ) : (
            <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-muted/50 text-center">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-secondary">
                  {initials(logo.name)}
                </span>
                <p className="mt-2 text-sm font-semibold text-secondary">{logo.name}</p>
              </div>
            </div>
          );

          const card = (
            <div className="group flex h-full min-h-[148px] flex-col justify-center rounded-[26px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]">
              {content}
              <p className="mt-4 text-center text-sm font-semibold text-secondary">{logo.name}</p>
            </div>
          );

          return logo.externalUrl ? (
            <a key={logo._id || logo.name} href={logo.externalUrl} target="_blank" rel="noreferrer" aria-label={logo.name}>
              {card}
            </a>
          ) : (
            <div key={logo._id || logo.name}>{card}</div>
          );
        })}
      </ContentCarousel>
    </section>
  );
}
