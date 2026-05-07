import Image from 'next/image';
import { SectionTitle } from './SectionTitle';
import { ClientLogoType } from '@/types';
import { ContentCarousel } from './ContentCarousel';
import { isDirectUploadAsset, resolveMediaUrl } from '@/lib/media';
import { Reveal } from './Reveal';

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
    <section id="clients" className="container-wide mt-12 space-y-6">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel
        itemsPerView={{ mobile: 2, tablet: 3, desktop: 5, wide: 6 }}
        autoPlayInterval={1800}
        advanceBy={1}
        controlsMode="none"
        viewportClassName="border-transparent bg-transparent p-0 shadow-none"
      >
        {logos.map((logo, index) => {
          const content = logo.logoImage ? (
            <div className="relative h-16 w-full sm:h-18 md:h-20">
              <Image src={resolveMediaUrl(logo.logoImage, '/logo-dnr.png')} alt={logo.name} fill className="object-contain" sizes="(max-width: 1024px) 50vw, 25vw" unoptimized={isDirectUploadAsset(logo.logoImage)} />
            </div>
          ) : (
            <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-muted/50 text-center sm:h-18 md:h-20">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-secondary">
                  {initials(logo.name)}
                </span>
                <p className="mt-2 text-sm font-semibold text-secondary">{logo.name}</p>
              </div>
            </div>
          );

          const card = (
            <div className="group flex h-full min-h-[132px] flex-col justify-center rounded-[24px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.97))] p-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)]">
              {content}
              <p className="mt-3 text-center text-sm font-semibold text-secondary">{logo.name}</p>
            </div>
          );

          return (
            <Reveal key={logo._id || logo.name} delay={index * 0.04} className="h-full">
              {logo.externalUrl ? (
                <a href={logo.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={logo.name}>
                  {card}
                </a>
              ) : (
                <div>{card}</div>
              )}
            </Reveal>
          );
        })}
      </ContentCarousel>
    </section>
  );
}
