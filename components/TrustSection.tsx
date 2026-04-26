import { SectionTitle } from './SectionTitle';
import { ContentCarousel } from './ContentCarousel';

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
    <section className="container-wide space-y-6 mt-12">
      <SectionTitle title={title} kicker={kicker} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}>
        {cards.map((p) => (
          <div
            key={p.title}
            className="h-full rounded-[26px] border border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(243,246,249,0.96))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]"
          >
            <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Trust signal
            </div>
            <h3 className="text-lg font-semibold text-secondary">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary/80">{p.desc}</p>
          </div>
        ))}
      </ContentCarousel>
    </section>
  );
}
