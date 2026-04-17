import Image from 'next/image';
import { SectionTitle } from './SectionTitle';
import { ClientLogoType } from '@/types';

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {logos.map((logo) => {
          const content = logo.logoImage ? (
            <div className="relative h-20 w-full">
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
            <div className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-md shadow-secondary/10 transition hover:-translate-y-1 hover:shadow-lg">
              {content}
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
      </div>
    </section>
  );
}
