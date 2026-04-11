import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Testimonials } from '@/components/Testimonials';
import { ProductGrid } from '@/components/ProductGrid';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ServiceGrid } from '@/components/ServiceGrid';
import { Coverage } from '@/components/Coverage';
import { InquiryForm } from '@/components/InquiryForm';
import { TrustSection } from '@/components/TrustSection';
import { FloatingSupport } from '@/components/FloatingSupport';
import { HeroSlider } from '@/components/HeroSlider';
import { fetchPublicData } from '@/lib/data';
import Link from 'next/link';

// Force dynamic rendering so builds don't require live DB access
export const dynamic = 'force-dynamic';

const INDUSTRIES = [
  { title: 'Foundry & casting', desc: 'Die casting, gravity casting, and sand core equipment for aluminium and ferrous parts.' },
  { title: 'Machining units', desc: 'CNC turning, turn-mill, VMC/HMC lines with tooling and process support.' },
  { title: 'Automotive OEMs', desc: 'Programs for powertrain, chassis, and precision components with traceability.' },
  { title: 'Metal components', desc: 'Precision machining and finishing for metal housings, fittings, and assemblies.' },
  { title: 'Automation lines', desc: 'Integrated automation for casting cells, leak testing, marking, and part handling.' },
  { title: 'Job shops', desc: 'Flexible machines and fixturing for high-mix, medium-volume production.' },
];
const FALLBACK_COVERAGE = [
  'Andhra Pradesh',
  'Gujarat',
  'Haryana',
  'Jammu',
  'Kolkata',
  'Madhya Pradesh',
  'Maharashtra',
  'New Delhi',
  'Punjab',
  'Rajasthan',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Odisha',
  'Tamil Nadu',
  'West Bengal',
];

export default async function HomePage() {
  const { products, categories, testimonials, homepage, settings, services } = await fetchPublicData();
  const hero = homepage?.hero || {
    heading: 'Your service partner for precision machinery & reliability',
    subheading: 'Engineer-owned team delivering casting, machining, marking, testing, and automation solutions with pan-India support.',
    ctaPrimary: 'View products',
    ctaSecondary: 'Contact us',
    tagline: 'DNR Techno Services — Industrial partners since 2010',
  };
  const about = homepage?.about || {
    heading: 'Engineer-owned. Customer-obsessed.',
    body: 'We pair intelligent machining solutions with pre & post-sales support, helping foundry, casting, CNC and automation plants stay online.',
    bullets: ['Application engineering & sizing', 'Installation & commissioning', 'Training and documentation', '24x7 service & spares'],
  };
  const why = homepage?.why || [
    'Technical expertise across casting, machining, marking, testing',
    'Pre & post-sales support with spares and documentation',
    'Wide machine range to match budgets and footprints',
    'Customer satisfaction and repeat engagements across India',
  ];

  const featuredProducts = (products || []).slice(0, 4);
  const coverage = Array.from(
    new Set([
      ...FALLBACK_COVERAGE,
      ...((settings?.coverageStates as string[] | undefined) || []),
    ])
  );

  return (
    <div className="bg-background text-secondary">
      <Nav />
      <main className="container-wide pt-14 pb-20 space-y-16">
        {/* Hero */}
        <section id="hero" className="grid md:grid-cols-[1.05fr,0.95fr] gap-10 items-center rounded-3xl bg-gradient-to-br from-white via-muted to-white p-8 md:p-12 border border-secondary/10 shadow-lg shadow-secondary/10">
          <div className="space-y-6">
            <span className="pill mb-2 inline-flex">{hero.tagline}</span>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-secondary">{hero.heading}</h1>
            <p className="text-secondary/80 text-lg leading-relaxed max-w-2xl">{hero.subheading}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="#products" className="btn-primary shadow-md">{hero.ctaPrimary || 'View products'}</Link>
              <Link href="#contact" className="btn-ghost border-secondary/20 bg-white text-secondary shadow-sm">{hero.ctaSecondary || 'Contact us'}</Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-secondary/80">
              <div className="rounded-xl border border-secondary/10 bg-white px-4 py-3 shadow-sm"><p className="text-3xl font-semibold text-secondary">50+</p><p>Plants covered</p></div>
              <div className="rounded-xl border border-secondary/10 bg-white px-4 py-3 shadow-sm"><p className="text-3xl font-semibold text-secondary">24x7</p><p>Response</p></div>
              <div className="rounded-xl border border-secondary/10 bg-white px-4 py-3 shadow-sm"><p className="text-3xl font-semibold text-secondary">15yr</p><p>Field experience</p></div>
            </div>
          </div>
          <HeroSlider />
        </section>

        {/* About preview */}
        <section id="about" className="glass rounded-3xl p-10 border border-secondary/10 bg-white/95 grid md:grid-cols-[1fr,1.1fr] gap-8 shadow-lg shadow-secondary/10">
          <div className="space-y-3">
            <p className="pill inline-flex">About</p>
            <h3 className="text-3xl font-semibold text-secondary">{about.heading}</h3>
            <p className="text-secondary/80">{about.body}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-secondary/90">
            {about.bullets.map((b: string) => (
              <div
                key={b}
                className="p-4 rounded-2xl bg-white border border-secondary/10 flex items-start gap-3 text-base shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 transition"
              >
                <span className="h-3 w-3 rounded-full bg-primary mt-1.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <CategoryGrid categories={categories || []} products={products || []} />

        {/* Services */}
        <ServiceGrid
          id="services"
          services={services || []}
          title="Services that keep plants online"
          kicker="Installation, commissioning, audits, diagnostics, and reliability programs for casting, machining, marking, and testing lines."
        />

        {/* Why choose */}
        <section id="why" className="glass rounded-3xl p-10 border border-accent/30 bg-white/90">
          <p className="pill inline-flex">Why choose DNR</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {why.map((item: string) => (
              <div key={item} className="p-4 rounded-2xl border border-muted/80 bg-muted/40 text-secondary/90">{item}</div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <Coverage states={coverage} />

        {/* Industries */}
        <section id="industries" className="container-wide space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="pill inline-flex">Industries & applications</p>
              <h3 className="text-3xl font-semibold text-secondary mt-3">Where DNR machinery runs</h3>
              <p className="text-secondary/75 mt-1">Capability across casting cells, machining lines, automation, and finishing.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {INDUSTRIES.map((ind) => (
              <div key={ind.title} className="rounded-2xl border border-secondary/10 bg-white p-5 shadow-md shadow-secondary/10 hover:-translate-y-1 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-secondary font-semibold">
                    {ind.title.slice(0, 2).toUpperCase()}
                  </span>
                  <h4 className="text-lg font-semibold text-secondary">{ind.title}</h4>
                </div>
                <p className="text-secondary/80 text-sm leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials">
          <Testimonials testimonials={testimonials} />
        </section>

        <TrustSection />

        {/* Inquiry CTA */}
        <section id="contact" className="glass rounded-3xl p-10 border border-accent/30 bg-white/90 grid md:grid-cols-2 gap-8 scroll-mt-28">
          <div className="space-y-4">
            <p className="pill inline-flex">Inquiry</p>
            <h3 className="text-3xl font-semibold text-secondary">Talk to an expert</h3>
            <p className="text-secondary/80">
              Share your requirement for casting, machining, marking, polishing, or testing equipment. We’ll recommend the right machine, commissioning plan, and service model.
            </p>
            <div className="space-y-2 text-lg text-secondary/80">
              <p className="font-semibold text-secondary">Quick contact</p>
              <div className="flex flex-col gap-1">
                <a className="text-primary font-semibold hover:underline" href="tel:+919711196735">Call: +91 97111 96735</a>
                <a className="text-primary font-semibold hover:underline" href="mailto:dnr.techservices@gmail.com">Email: dnr.techservices@gmail.com</a>
                <a className="text-primary font-semibold hover:underline" href="https://wa.me/919711196735" target="_blank" rel="noreferrer">WhatsApp: +91 97111 96735</a>
              </div>
            </div>
          </div>
          <InquiryForm />
        </section>
      </main>
      <Footer />
      <FloatingSupport />
    </div>
  );
}
