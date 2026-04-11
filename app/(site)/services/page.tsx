import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ServiceGrid } from '@/components/ServiceGrid';
import { fetchPublicData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const { services } = await fetchPublicData();
  return (
    <div className="bg-white text-secondary min-h-screen">
      <Nav />
      <main className="container-wide pt-16 pb-20 space-y-10">
        <div className="space-y-2">
          <p className="pill inline-flex">Services</p>
          <h1 className="text-4xl font-semibold text-secondary">Field services & diagnostic programs</h1>
          <p className="text-secondary/80 max-w-3xl">
            From thermal imaging and vibration analysis to ultrasonic leak detection and energy audits, we deliver end-to-end reliability engineering for heavy industry.
          </p>
        </div>
        <ServiceGrid services={services} id="services" />
      </main>
      <Footer />
    </div>
  );
}
