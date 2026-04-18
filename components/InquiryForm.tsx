'use client';

import { useState } from 'react';

type InquiryFormConfig = {
  fields?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message', boolean>>;
  labels?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message' | 'submit', string>>;
};

type InquiryFormProps = {
  config?: InquiryFormConfig;
};

const defaultLabels = {
  name: 'Name',
  company: 'Company',
  phone: 'Phone',
  email: 'Email',
  productInterest: 'Product interest',
  message: 'Message',
  submit: 'Send inquiry',
};

const defaultFields = {
  name: true,
  company: true,
  phone: true,
  email: true,
  productInterest: true,
  message: true,
};

export function InquiryForm({ config }: InquiryFormProps) {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', productInterest: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const labels = { ...defaultLabels, ...(config?.labels || {}) };
  const fields = { ...defaultFields, ...(config?.fields || {}) };

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
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.name && (
          <input className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]" placeholder={labels.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        )}
        {fields.company && (
          <input className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]" placeholder={labels.company} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        )}
        {fields.phone && (
          <input className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]" placeholder={labels.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        )}
        {fields.email && (
          <input className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]" placeholder={labels.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        )}
        {fields.productInterest && (
          <input
            className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)] md:col-span-2"
            placeholder={labels.productInterest}
            value={form.productInterest}
            onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
          />
        )}
        {fields.message && (
          <textarea
            className="rounded-2xl border border-secondary/10 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)] md:col-span-2"
            rows={4}
            placeholder={labels.message}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        )}
      </div>
      <button type="submit" className="btn-primary min-w-[180px]" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : labels.submit}
      </button>
      {status === 'done' && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Thanks, we’ll contact you shortly.</p>}
      {status === 'error' && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Could not send. Try again.</p>}
    </form>
  );
}
