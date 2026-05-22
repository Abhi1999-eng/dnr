import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#071014] px-6 py-24 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7ed321]">404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-slate-300">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="mt-8 inline-flex rounded-2xl bg-[#7ed321] px-6 py-3 font-semibold text-slate-950 shadow-[0_16px_34px_rgba(126,211,33,0.22)]">
          Go home
        </Link>
      </div>
    </main>
  );
}
