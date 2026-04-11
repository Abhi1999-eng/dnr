import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div>
      <Nav />
      <main className="container-wide pt-16 pb-20 space-y-8 max-w-4xl">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">About</p>
        <h1 className="text-4xl font-semibold text-white">Engineer-owned. Reliability obsessed.</h1>
        <p className="text-slate-300 leading-relaxed">
          DNR Techno Services is a Delhi-headquartered engineering firm focused on keeping critical manufacturing assets online. We combine thermal imaging, vibration analysis, ultrasound
          inspection, and reliability engineering to prevent unplanned downtime across automotive, foundry, pharma, FMCG, and process industries.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-semibold text-white">Coverage</h3>
            <p className="text-slate-300 mt-2">Teams on ground across Delhi NCR, Gujarat, Maharashtra, Telangana, Andhra Pradesh, Punjab, Rajasthan, and more.</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-semibold text-white">Approach</h3>
            <p className="text-slate-300 mt-2">Rapid diagnostics with executive-ready reports: findings, risk ranking, root cause, parts list, and remediation window.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
