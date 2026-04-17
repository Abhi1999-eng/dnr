import Image from 'next/image';
import Link from 'next/link';
import { SectionTitle } from './SectionTitle';
import { FeaturedMachineType } from '@/types';

export function FeaturedMachinesSection({
  title = 'Featured Machine',
  kicker = 'Highlighted production-ready machinery from the latest DNR materials.',
  machines,
}: {
  title?: string;
  kicker?: string;
  machines: FeaturedMachineType[];
}) {
  const activeMachines = machines.filter((machine) => machine.active !== false && machine.featured !== false);
  if (!activeMachines.length) return null;

  return (
    <section id="featured-machines" className="container-wide mt-16 space-y-8">
      <SectionTitle title={title} kicker={kicker} />
      <div className="grid gap-6">
        {activeMachines.map((machine) => (
          <div
            key={machine._id || machine.slug}
            className="grid gap-6 rounded-[2rem] border border-secondary/10 bg-white p-6 shadow-xl shadow-secondary/10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] border border-secondary/10 bg-muted/30 aspect-[4/5] min-h-[320px]">
              {machine.image && <Image src={machine.image} alt={machine.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />}
            </div>
            <div className="space-y-5">
              <div className="space-y-3">
                <span className="pill inline-flex">Featured machine</span>
                <h3 className="text-3xl font-semibold text-secondary md:text-4xl">{machine.title}</h3>
                <p className="max-w-2xl text-base leading-relaxed text-secondary/80">{machine.shortDescription}</p>
              </div>
              {machine.bullets?.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {machine.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl border border-secondary/10 bg-muted/30 px-4 py-3 text-sm font-medium text-secondary/85">
                      {bullet}
                    </div>
                  ))}
                </div>
              ) : null}
              <div>
                <Link href={machine.ctaLink || '#contact'} className="btn-primary">
                  {machine.ctaLabel || 'Request Details'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
