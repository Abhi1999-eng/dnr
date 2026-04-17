'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type QuickLink = { label: string; type: string; value: string; href?: string; active?: boolean; sortOrder?: number };

const defaultSettings = {
  primaryPhone: '',
  secondaryPhone: '',
  whatsappNumber: '',
  email: '',
  address: '',
  headerCtaLabel: 'Talk to an Expert',
  headerCtaTarget: '#contact',
  floatingSupportLabel: 'WhatsApp Support',
  contactQuickLinks: [] as QuickLink[],
  inquiryForm: {
    heading: 'Talk to an expert',
    description: '',
    fields: { name: true, company: true, phone: true, email: true, productInterest: true, message: true },
    labels: { name: 'Name', company: 'Company', phone: 'Phone', email: 'Email', productInterest: 'Product interest', message: 'Message', submit: 'Send inquiry' },
  },
};

function normalizeSettings(data: any) {
  if (!data) return defaultSettings;
  return {
    ...defaultSettings,
    ...data,
    primaryPhone: data.primaryPhone || data.phone?.[0] || '',
    secondaryPhone: data.secondaryPhone || data.phone?.[1] || '',
    contactQuickLinks: data.contactQuickLinks || [],
    inquiryForm: {
      ...defaultSettings.inquiryForm,
      ...(data.inquiryForm || {}),
      fields: { ...defaultSettings.inquiryForm.fields, ...(data.inquiryForm?.fields || {}) },
      labels: { ...defaultSettings.inquiryForm.labels, ...(data.inquiryForm?.labels || {}) },
    },
  };
}

export default function AdminContactPage() {
  const { data, mutate } = useSWR('/api/settings', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<typeof defaultSettings | null>(null);

  const settings = draft ?? normalizeSettings(data);

  async function save() {
    const payload = {
      ...data,
      ...settings,
      phone: [settings.primaryPhone, settings.secondaryPhone].filter(Boolean),
    };
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(payload),
    });
    setDraft(null);
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Contact Settings</h1>
          <p className="text-sm text-slate-400">These values drive the header CTA, floating WhatsApp button, inquiry section, and footer contact actions.</p>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Primary contact details</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Primary phone" value={settings.primaryPhone} onChange={(e) => setDraft({ ...settings, primaryPhone: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Secondary phone" value={settings.secondaryPhone} onChange={(e) => setDraft({ ...settings, secondaryPhone: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="WhatsApp number" value={settings.whatsappNumber} onChange={(e) => setDraft({ ...settings, whatsappNumber: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Email" value={settings.email} onChange={(e) => setDraft({ ...settings, email: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Address" value={settings.address} onChange={(e) => setDraft({ ...settings, address: e.target.value })} />
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Header & floating CTA</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Header CTA label" value={settings.headerCtaLabel} onChange={(e) => setDraft({ ...settings, headerCtaLabel: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Header CTA target" value={settings.headerCtaTarget} onChange={(e) => setDraft({ ...settings, headerCtaTarget: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Floating support label" value={settings.floatingSupportLabel} onChange={(e) => setDraft({ ...settings, floatingSupportLabel: e.target.value })} />
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Quick contact links</h2>
          <textarea
            className="min-h-36 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            placeholder="label|type|value|href(optional) one per line"
            value={settings.contactQuickLinks.map((item: QuickLink) => [item.label, item.type, item.value, item.href || ''].join('|')).join('\n')}
            onChange={(e) =>
              setDraft({
                ...settings,
                contactQuickLinks: e.target.value
                  .split('\n')
                  .map((line: string, index: number) => {
                    const [label, type, value, href] = line.split('|').map((part) => part.trim());
                    if (!label || !type || !value) return null;
                    return { label, type, value, href, active: true, sortOrder: index + 1 };
                  })
                  .filter(Boolean) as typeof settings.contactQuickLinks,
              })
            }
          />
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Inquiry form content</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Form heading" value={settings.inquiryForm.heading} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, heading: e.target.value } })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Submit label" value={settings.inquiryForm.labels.submit} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, labels: { ...settings.inquiryForm.labels, submit: e.target.value } } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Description / help text" value={settings.inquiryForm.description} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, description: e.target.value } })} />
          </div>
        </div>

        <button onClick={save} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
          Save contact settings
        </button>
      </div>
    </AdminShell>
  );
}
