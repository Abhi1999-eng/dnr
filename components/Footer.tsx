import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20 py-12 bg-slate-950/80">
      <div className="container-wide grid md:grid-cols-3 gap-8 text-sm text-slate-300">
        <div>
          <h3 className="text-white font-semibold">DNR Techno Services</h3>
          <p className="mt-3 text-slate-400">Industrial thermal imaging, vibration analysis, ultrasound, and reliability engineering across India.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold">Company</h4>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold">Contact</h4>
          <p className="mt-3">+91 9711196735 / 9911399919</p>
          <p>info@dnrtechnoservices.com</p>
          <p className="text-slate-400 mt-2">27-A, Parda Bagh, Daryaganj, Delhi - 110002</p>
        </div>
      </div>
    </footer>
  );
}
