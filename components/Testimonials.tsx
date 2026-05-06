import { SectionTitle } from './SectionTitle';
import { Quote } from 'lucide-react';
import { ContentCarousel } from './ContentCarousel';

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
}: {
  testimonials: TestimonialType[];
  title?: string;
  kicker?: string;
}) {
  if (!testimonials.length) return null;

  return (
    <section className="container-wide mt-12 space-y-4">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 2, wide: 3 }}>
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="h-full rounded-[24px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(15,23,42,0.12)]"
          >
            <div className="flex h-full flex-col justify-between space-y-5">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Quote size={18} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/75">Client feedback</span>
                </div>
                <p className="text-sm leading-relaxed text-secondary md:text-[0.98rem]">“{t.feedback}”</p>
              </div>
              <div className="rounded-2xl border border-secondary/10 bg-secondary/[0.03] px-3.5 py-2.5 text-sm text-secondary/80">
                <p className="font-semibold text-secondary">{t.name}</p>
                <p>{t.role || 'Plant / Maintenance Lead'}{t.company ? ` · ${t.company}` : ''}</p>
                {t.sector && <p className="text-secondary/75">{t.sector}</p>}
              </div>
            </div>
          </div>
        ))}
      </ContentCarousel>
    </section>
  );
}
