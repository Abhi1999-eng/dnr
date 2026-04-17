import { SectionTitle } from './SectionTitle';
import { Quote } from 'lucide-react';

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
    <section className="container-wide mt-16 space-y-8">
      <SectionTitle title={title} kicker={kicker} />
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border border-secondary/10 bg-white shadow-lg shadow-secondary/10 p-6 space-y-4 hover:-translate-y-1 transition"
          >
            <div className="flex items-center gap-2 text-primary">
              <Quote size={18} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary/70">Testimonial</span>
            </div>
            <p className="text-secondary leading-relaxed text-sm md:text-base">“{t.feedback}”</p>
            <div className="text-sm text-secondary/80">
              <p className="font-semibold text-secondary">{t.name}</p>
              <p>{t.role || 'Plant / Maintenance Lead'}{t.company ? ` · ${t.company}` : ''}</p>
              {t.sector && <p className="text-secondary/60">{t.sector}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
