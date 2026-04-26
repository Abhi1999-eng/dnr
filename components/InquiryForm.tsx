'use client';

import { useState } from 'react';

type InquiryFormConfig = {
  fields?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message', boolean>>;
  labels?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message' | 'submit', string>>;
};

type InquiryFormProps = {
  config?: InquiryFormConfig;
  initialValues?: Partial<{ name: string; company: string; phone: string; email: string; productInterest: string; message: string }>;
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

export function InquiryForm({ config, initialValues }: InquiryFormProps) {
  const startingValues = { name: '', company: '', phone: '', email: '', productInterest: '', message: '', ...(initialValues || {}) };
  const [form, setForm] = useState(startingValues);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const labels = { ...defaultLabels, ...(config?.labels || {}) };
  const fields = { ...defaultFields, ...(config?.fields || {}) };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setForm(startingValues);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.name && (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-secondary">{labels.name}</span>
            <input
              aria-label={labels.name}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary shadow-sm outline-none transition placeholder:text-secondary/45 focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]"
              placeholder={labels.name}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
        )}
        {fields.company && (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-secondary">{labels.company}</span>
            <input
              aria-label={labels.company}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary shadow-sm outline-none transition placeholder:text-secondary/45 focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]"
              placeholder={labels.company}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </label>
        )}
        {fields.phone && (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-secondary">{labels.phone}</span>
            <input
              aria-label={labels.phone}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary shadow-sm outline-none transition placeholder:text-secondary/45 focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]"
              placeholder={labels.phone}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
        )}
        {fields.email && (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-secondary">{labels.email}</span>
            <input
              aria-label={labels.email}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary shadow-sm outline-none transition placeholder:text-secondary/45 focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]"
              placeholder={labels.email}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
            />
          </label>
        )}
        {fields.productInterest && (
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-secondary">{labels.productInterest}</span>
            <input
              aria-label={labels.productInterest}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary shadow-sm outline-none transition placeholder:text-secondary/45 focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]"
              placeholder={labels.productInterest}
              value={form.productInterest}
              onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
            />
          </label>
        )}
        {fields.message && (
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-secondary">{labels.message}</span>
            <textarea
              aria-label={labels.message}
              className="min-h-[140px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary shadow-sm outline-none transition placeholder:text-secondary/45 focus:border-primary focus:shadow-[0_0_0_4px_rgba(139,197,63,0.12)]"
              rows={5}
              placeholder={labels.message}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </label>
        )}
      </div>
      <button type="submit" className="btn-primary min-h-12 w-full justify-center text-base shadow-lg shadow-primary/20 md:w-auto md:min-w-[220px]" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : labels.submit}
      </button>
      {status === 'done' && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Thanks, we’ll contact you shortly.</p>}
      {status === 'error' && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Please add your name and at least one contact method so we can respond.</p>}
    </form>
  );
}
