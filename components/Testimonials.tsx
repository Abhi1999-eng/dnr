import { SectionTitle } from './SectionTitle';
import { Quote } from 'lucide-react';
import { ContentCarousel } from './ContentCarousel';
import { Reveal } from './Reveal';

export type TestimonialType = {
  _id?: string;
  name: string;
  feedback: string;
  rating?: number;
  role?: string;
  company?: string;
  sector?: string;
};

export function Testimonials({
  testimonials,
  title = 'Trusted by plant heads and maintenance leaders',
  kicker = 'High-uptime plants choose DNR for reliable installs, responsive service, and clear communication.',
  theme = 'light',
}: {
  testimonials: TestimonialType[];
  title?: string;
  kicker?: string;
  theme?: 'light' | 'dark';
}) {
  if (!testimonials.length) return null;

  const isDark = theme === 'dark';

  return (
    <section className="container-wide mt-10 space-y-4">
      <SectionTitle title={title} kicker={kicker} theme={theme} eyebrow={isDark ? 'Testimonials' : undefined} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, wide: 3 }} theme={theme}>
        {testimonials.map((t, index) => (
          <Reveal key={t.name} delay={index * 0.06} className="h-full">
            <div className={`h-full rounded-[24px] border p-5 transition hover:-translate-y-1 ${isDark ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(10,16,20,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.24)] hover:shadow-[0_24px_54px_rgba(0,0,0,0.32)]' : 'border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] shadow-[0_18px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_44px_rgba(15,23,42,0.12)]'}`}>
              <div className="flex h-full flex-col justify-between space-y-5">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? 'bg-[#7ed321]/14 text-[#7ed321]' : 'bg-primary/12 text-primary'}`}>
                      <Quote size={18} />
                    </div>
                    <span className={isDark ? 'text-xs font-semibold uppercase tracking-[0.22em] text-white/65' : 'text-xs font-semibold uppercase tracking-[0.22em] text-secondary/75'}>Client feedback</span>
                  </div>
                  <p className={isDark ? 'text-sm leading-relaxed text-[#e8edf1] md:text-[0.98rem]' : 'text-sm leading-relaxed text-secondary md:text-[0.98rem]'}>“{t.feedback}”</p>
                </div>
                <div className={`rounded-2xl border px-3.5 py-2.5 text-sm ${isDark ? 'border-white/10 bg-white/5 text-[#aab4bd]' : 'border-secondary/10 bg-secondary/[0.03] text-secondary/80'}`}>
                  <p className={isDark ? 'font-semibold text-white' : 'font-semibold text-secondary'}>{t.name}</p>
                  <p>
                    {t.role || 'Plant / Maintenance Lead'}
                    {t.company ? ` · ${t.company}` : ''}
                  </p>
                  {t.sector && <p className={isDark ? 'text-white/70' : 'text-secondary/75'}>{t.sector}</p>}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </ContentCarousel>
    </section>
  );
}
