'use client';

import { useMemo, useState } from 'react';

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
  productInterest: 'Product Interest',
  message: 'Message',
  submit: 'Send Inquiry',
};

const defaultFields = {
  name: true,
  company: true,
  phone: true,
  email: true,
  productInterest: true,
  message: true,
};

const inputClassName =
  'h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-secondary outline-none transition placeholder:text-secondary/40 focus:border-lime-500 focus:ring-4 focus:ring-lime-100';

const textareaClassName =
  'min-h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-secondary outline-none transition placeholder:text-secondary/40 focus:border-lime-500 focus:ring-4 focus:ring-lime-100';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-secondary/80">{label}</span>
      {children}
    </label>
  );
}

export function InquiryForm({ config, initialValues }: InquiryFormProps) {
  const startingValues = useMemo(
    () => ({ name: '', company: '', phone: '', email: '', productInterest: '', message: '', ...(initialValues || {}) }),
    [initialValues]
  );

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
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.name ? (
          <Field label={labels.name}>
            <input
              aria-label={labels.name}
              className={inputClassName}
              placeholder={labels.name}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
        ) : null}

        {fields.company ? (
          <Field label={labels.company}>
            <input
              aria-label={labels.company}
              className={inputClassName}
              placeholder={labels.company}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </Field>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.phone ? (
          <Field label={labels.phone}>
            <input
              aria-label={labels.phone}
              className={inputClassName}
              placeholder={labels.phone}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
        ) : null}

        {fields.email ? (
          <Field label={labels.email}>
            <input
              aria-label={labels.email}
              className={inputClassName}
              placeholder={labels.email}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        ) : null}
      </div>

      {fields.productInterest ? (
        <Field label={labels.productInterest}>
          <input
            aria-label={labels.productInterest}
            className={inputClassName}
            placeholder={labels.productInterest}
            value={form.productInterest}
            onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
          />
        </Field>
      ) : null}

      {fields.message ? (
        <Field label={labels.message}>
          <textarea
            aria-label={labels.message}
            className={textareaClassName}
            placeholder={labels.message}
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </Field>
      ) : null}

      <div className="pt-1">
        <button
          type="submit"
          className="inline-flex h-14 min-w-[220px] items-center justify-center rounded-2xl bg-primary px-7 text-base font-semibold text-secondary transition hover:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-70 max-md:w-full"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending…' : labels.submit}
        </button>
      </div>

      {status === 'done' ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Thanks, we’ll contact you shortly.</p> : null}
      {status === 'error' ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Please add your name and at least one contact method so we can respond.</p>
      ) : null}
    </form>
  );
}
