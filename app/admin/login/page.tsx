'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin/dashboard';
  const [email, setEmail] = useState('admin@dnr.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError('Invalid credentials');
      return;
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('dnr_token', data.token);
      // Ensure middleware sees the cookie even if the httpOnly set-cookie is blocked in dev
      document.cookie = `dnr_token=${data.token}; path=/; SameSite=Lax`;
      // Force a full navigation so the new cookie is sent on the next request
      window.location.href = next;
      return;
    }
    router.push(next);
  }

  return (
    <div className="admin-ui min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,197,63,0.08),_transparent_32%),linear-gradient(180deg,_#020617,_#0f172a)] px-4">
      <div className="glass border border-white/10 rounded-3xl p-8 w-[380px] space-y-4">
        <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
        <p className="text-sm text-slate-400">Sign in to manage homepage content, settings, products, and business sections.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-white text-slate-900 py-3 font-semibold">Sign in</button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}> 
      <LoginForm />
    </Suspense>
  );
}
