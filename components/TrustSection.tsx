import { SectionTitle } from './SectionTitle';

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
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-md shadow-secondary/10 hover:-translate-y-1 hover:shadow-lg transition"
          >
            <h4 className="text-lg font-semibold text-secondary">{p.title}</h4>
            <p className="text-secondary/80 text-sm leading-relaxed mt-1">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
