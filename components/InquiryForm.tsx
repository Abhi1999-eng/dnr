'use client';
import { useState } from 'react';

export function InquiryForm() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', productInterest: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setForm({ name: '', company: '', phone: '', email: '', productInterest: '', message: '' });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <input className="bg-white border-2 border-muted/80 focus:border-primary rounded-lg px-3 py-2 outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="bg-white border-2 border-muted/80 focus:border-primary rounded-lg px-3 py-2 outline-none" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input className="bg-white border-2 border-muted/80 focus:border-primary rounded-lg px-3 py-2 outline-none" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="bg-white border-2 border-muted/80 focus:border-primary rounded-lg px-3 py-2 outline-none" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input
          className="bg-white border-2 border-muted/80 focus:border-primary rounded-lg px-3 py-2 outline-none md:col-span-2"
          placeholder="Product interest"
          value={form.productInterest}
          onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
        />
        <textarea
          className="bg-white border-2 border-muted/80 focus:border-primary rounded-lg px-3 py-2 outline-none md:col-span-2"
          rows={4}
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send inquiry'}
      </button>
      {status === 'done' && <p className="text-green-700 text-sm">Thanks, we’ll contact you shortly.</p>}
      {status === 'error' && <p className="text-red-600 text-sm">Could not send. Try again.</p>}
    </form>
  );
}
