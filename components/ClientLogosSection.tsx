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
  theme = 'light',
}: {
  title?: string;
  kicker?: string;
  logos: ClientLogoType[];
  theme?: 'light' | 'dark';
}) {
  if (!logos.length) return null;

  const isDark = theme === 'dark';

  return (
    <section id="clients" className="container-wide mt-10 space-y-4">
      <SectionTitle title={title} kicker={kicker} theme={theme} eyebrow={isDark ? 'Associated brands' : undefined} />
      <ContentCarousel
        itemsPerView={{ mobile: 2, tablet: 3, desktop: 5, wide: 6 }}
        autoPlayInterval={1800}
        advanceBy={1}
        controlsMode="none"
        viewportClassName="border-transparent bg-transparent p-0 shadow-none"
        theme={theme}
      >
        {logos.map((logo, index) => {
          const content = logo.logoImage ? (
            <div className="relative h-16 w-full sm:h-18 md:h-20">
              <Image
                src={resolveMediaUrl(logo.logoImage, '/logo-dnr.png')}
                alt={logo.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized={isDirectUploadAsset(logo.logoImage)}
              />
            </div>
          ) : (
            <div className={`flex h-16 w-full items-center justify-center rounded-2xl text-center sm:h-18 md:h-20 ${isDark ? 'bg-white/5 text-white' : 'bg-muted/50 text-secondary'}`}>
              <div>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isDark ? 'bg-[#7ed321]/15 text-[#7ed321]' : 'bg-primary/15 text-secondary'}`}>
                  {initials(logo.name)}
                </span>
                <p className={`mt-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-secondary'}`}>{logo.name}</p>
              </div>
            </div>
          );

          const card = (
            <div className={`group flex h-full min-h-[132px] flex-col justify-center rounded-[24px] border p-4 transition ${isDark ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(10,16,20,0.98))] shadow-[0_18px_40px_rgba(0,0,0,0.24)] hover:-translate-y-0.5 hover:border-[#7ed321]/38 hover:shadow-[0_22px_48px_rgba(0,0,0,0.3)]' : 'border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.97))] shadow-[0_14px_32px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)]'}`}>
              {content}
              <p className={`mt-3 text-center text-sm font-semibold ${isDark ? 'text-white/90' : 'text-secondary'}`}>{logo.name}</p>
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
