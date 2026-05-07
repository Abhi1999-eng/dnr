import { SectionTitle } from './SectionTitle';
import { ContentCarousel } from './ContentCarousel';
import { Reveal } from './Reveal';

export function TrustSection({
  title = 'Trusted across manufacturing',
  kicker = 'Operational proof instead of placeholders.',
  cards = [],
}: {
  title?: string;
  kicker?: string;
  cards?: { title: string; desc: string }[];
}) {
  if (!cards.length) return null;

  return (
    <section className="container-wide mt-10 space-y-5">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}>
        {cards.map((p, index) => (
          <Reveal key={p.title} delay={index * 0.06} className="h-full">
            <div className="h-full rounded-[22px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(243,246,249,0.96))] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]">
              <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Trust signal
              </div>
              <h3 className="text-lg font-semibold text-secondary">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary/80">{p.desc}</p>
            </div>
          </Reveal>
        ))}
      </ContentCarousel>
    </section>
  );
}
