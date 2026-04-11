import { SectionTitle } from './SectionTitle';

const proofPoints = [
  { title: '50+ plants supported', desc: 'Die casting, CNC, marking, and testing programs across India.' },
  { title: '24x7 response', desc: 'Service engineers and spares support with clear SLAs.' },
  { title: 'Multi-OEM expertise', desc: 'Casting cells, CNC, automation, leak testing, and finishing lines.' },
  { title: 'Install to audit', desc: 'Installation, commissioning, training, documentation, and reliability audits.' },
];

export function TrustSection() {
  return (
    <section className="container-wide space-y-6 mt-12">
      <SectionTitle title="Trusted across manufacturing" kicker="Operational proof instead of placeholders." />
      <div className="grid md:grid-cols-4 gap-4">
        {proofPoints.map((p) => (
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
