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
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {fields.name && (
          <input className="rounded-lg border-2 border-muted/80 bg-white px-3 py-2 outline-none focus:border-primary" placeholder={labels.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        )}
        {fields.company && (
          <input className="rounded-lg border-2 border-muted/80 bg-white px-3 py-2 outline-none focus:border-primary" placeholder={labels.company} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        )}
        {fields.phone && (
          <input className="rounded-lg border-2 border-muted/80 bg-white px-3 py-2 outline-none focus:border-primary" placeholder={labels.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        )}
        {fields.email && (
          <input className="rounded-lg border-2 border-muted/80 bg-white px-3 py-2 outline-none focus:border-primary" placeholder={labels.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        )}
        {fields.productInterest && (
          <input
            className="rounded-lg border-2 border-muted/80 bg-white px-3 py-2 outline-none focus:border-primary md:col-span-2"
            placeholder={labels.productInterest}
            value={form.productInterest}
            onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
          />
        )}
        {fields.message && (
          <textarea
            className="rounded-lg border-2 border-muted/80 bg-white px-3 py-2 outline-none focus:border-primary md:col-span-2"
            rows={4}
            placeholder={labels.message}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        )}
      </div>
      <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : labels.submit}
      </button>
      {status === 'done' && <p className="text-sm text-green-700">Thanks, we’ll contact you shortly.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Could not send. Try again.</p>}
    </form>
  );
}
