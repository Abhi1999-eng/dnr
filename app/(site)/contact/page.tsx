import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <div>
      <Nav />
      <main className="container-wide pt-16 pb-20 max-w-3xl space-y-8">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Contact</p>
        <h1 className="text-4xl font-semibold text-white">Talk to an engineer</h1>
        <p className="text-slate-300">Share your plant, asset mix, and current pain points. We respond within one business day.</p>
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <form className="space-y-4">
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3" placeholder="Name" />
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3" placeholder="Email" />
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3" placeholder="Phone" />
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3" rows={4} placeholder="How can we help?" />
            <button type="submit" className="rounded-full bg-white text-slate-900 px-6 py-3 font-semibold">Send</button>
          </form>
          <div className="text-sm text-slate-400">
            <p>Phone: +91 9711196735 / 9911399919</p>
            <p>Email: info@dnrtechnoservices.com</p>
            <p>Delhi, India</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
