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
  theme = 'light',
}: {
  services: ServiceType[];
  id?: string;
  title?: string;
  kicker?: string;
  theme?: 'light' | 'dark';
}) {
  if (!services.length) return null;

  const isDark = theme === 'dark';

  return (
    <section id={id} className="container-wide mt-10 scroll-mt-24 space-y-5 md:mt-10">
      <SectionTitle title={title} kicker={kicker} theme={theme} eyebrow={isDark ? 'Service coordination' : undefined} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 4, wide: 4 }} gapRem={1} autoPlayInterval={3000} theme={theme}>
        {services.map((service, index) => {
          const imgSrc = resolveServiceImage(service);
          const href = service.slug ? `/services/${service.slug}` : '/services';
          return (
            <Reveal key={service._id || service.slug || service.title} delay={index * 0.05} className="h-full">
              <Link
                href={href}
                className={`group flex min-h-[230px] h-full flex-col rounded-[26px] border p-5 transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(12,18,24,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.24)] hover:border-[#7ed321]/45 hover:shadow-[0_24px_58px_rgba(0,0,0,0.34)]'
                    : 'border-slate-200 bg-white shadow-sm hover:border-primary/50 hover:shadow-[0_18px_36px_rgba(15,23,42,0.10)]'
                }`}
              >
                <div className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border p-2 md:h-[72px] md:w-[72px] ${isDark ? 'border-[rgba(126,211,33,0.18)] bg-[radial-gradient(circle_at_center,rgba(126,211,33,0.12),transparent_65%),rgba(255,255,255,0.02)]' : 'border-slate-200 bg-slate-50'}`}>
                  <ManagedImage src={imgSrc} alt={service.title} fill className="object-contain object-center p-2" sizes="72px" />
                </div>

                <div className="mt-5 space-y-2">
                  <h3 className={isDark ? 'text-base font-semibold leading-snug text-white' : 'text-base font-semibold leading-snug text-slate-900'}>{service.title}</h3>
                  <p className={isDark ? 'line-clamp-2 text-sm leading-6 text-[#aab4bd]' : 'line-clamp-2 text-sm leading-6 text-slate-600'}>{service.description}</p>
                </div>

                <div className={isDark ? 'mt-auto pt-4 text-sm font-semibold text-white transition group-hover:text-[#7ed321]' : 'mt-auto pt-4 text-sm font-semibold text-slate-900 transition group-hover:text-lime-600'}>
                  Learn more →
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ContentCarousel>
    </section>
  );
}
