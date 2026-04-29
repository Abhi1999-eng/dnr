import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-lime-600">404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-slate-600">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="mt-8 inline-flex rounded-2xl bg-lime-500 px-6 py-3 font-semibold text-slate-950">
          Go home
        </Link>
      </div>
    </main>
  );
}
