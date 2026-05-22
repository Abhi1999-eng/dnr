import { SectionTitle } from './SectionTitle';
import { ContentCarousel } from './ContentCarousel';
import { Reveal } from './Reveal';

export function TrustSection({
  title = 'Trusted across manufacturing',
  kicker = 'Operational proof instead of placeholders.',
  cards = [],
  theme = 'light',
}: {
  title?: string;
  kicker?: string;
  cards?: { title: string; desc: string }[];
  theme?: 'light' | 'dark';
}) {
  if (!cards.length) return null;

  const isDark = theme === 'dark';

  return (
    <section className="container-wide mt-10 space-y-4">
      <SectionTitle title={title} kicker={kicker} theme={theme} eyebrow={isDark ? 'Why choose us' : undefined} />
      <ContentCarousel itemsPerView={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }} theme={theme}>
        {cards.map((p, index) => (
          <Reveal key={p.title} delay={index * 0.06} className="h-full">
            <div className={`h-full rounded-[22px] border p-4 transition hover:-translate-y-1 ${isDark ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(10,16,20,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.24)] hover:shadow-[0_24px_54px_rgba(0,0,0,0.32)]' : 'border-secondary/10 bg-[linear-gradient(180deg,#ffffff,rgba(243,246,249,0.96))] shadow-[0_16px_36px_rgba(15,23,42,0.08)] hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]'}`}>
              <div className={`mb-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'border-[#7ed321]/22 bg-[#7ed321]/10 text-[#d5f4a8]' : 'border-primary/20 bg-primary/10 text-secondary'}`}>
                Trust signal
              </div>
              <h3 className={isDark ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-secondary'}>{p.title}</h3>
              <p className={isDark ? 'mt-2 text-sm leading-relaxed text-[#aab4bd]' : 'mt-2 text-sm leading-relaxed text-secondary/80'}>{p.desc}</p>
            </div>
          </Reveal>
        ))}
      </ContentCarousel>
    </section>
  );
}
