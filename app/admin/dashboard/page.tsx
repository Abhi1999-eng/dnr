'use client';
import { AdminShell } from '@/components/AdminShell';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: services } = useSWR('/api/services', fetcher);
  const { data: testimonials } = useSWR('/api/testimonials', fetcher);
  const serviceCount = Array.isArray(services) ? services.length : 0;
  const testimonialCount = Array.isArray(testimonials) ? testimonials.length : 0;

  const cards = [
    { label: 'Services', value: serviceCount },
    { label: 'Testimonials', value: testimonialCount },
    { label: 'Ready to configure', value: 'CMS' },
  ];

  return (
    <AdminShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-slate-400">This installation is ready for manual setup. Create products, services, logos, and homepage content from the sidebar.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="glass rounded-2xl p-5 border border-white/10">
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="text-2xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
