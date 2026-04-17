'use client';

import useSWR from 'swr';
import { ChangeEvent, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type QuickLink = { label: string; type: string; value: string; href?: string; active?: boolean; sortOrder?: number };
type FooterLink = { label: string; href: string };
type InquiryFieldKey = 'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message';

const defaultSettings = {
  companyName: '',
  logo: '',
  primaryPhone: '',
  secondaryPhone: '',
  whatsappNumber: '',
  address: '',
  phone: [] as string[],
  email: '',
  website: '',
  mapLink: '',
  coverageStates: [] as string[],
  footerDescription: '',
  headerCtaLabel: 'Talk to an Expert',
  headerCtaTarget: '#contact',
  contactCtaLabel: 'Send inquiry',
  floatingSupportLabel: 'WhatsApp Support',
  inquiryIntro: '',
  inquiryResponseText: '',
  footerLinks: [
    { label: 'About', href: '/about' },
    { label: 'Products', href: '/products' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ],
  contactQuickLinks: [] as QuickLink[],
  inquiryForm: {
    heading: 'Talk to an expert',
    description: '',
    fields: { name: true, company: true, phone: true, email: true, productInterest: true, message: true },
    labels: { name: 'Name', company: 'Company', phone: 'Phone', email: 'Email', productInterest: 'Product interest', message: 'Message', submit: 'Send inquiry' },
  },
  seo: { title: '', description: '', ogImage: '' },
};

function normalizeSettings(data: any) {
  if (!data) return defaultSettings;
  return {
    ...defaultSettings,
    ...data,
    phone: data.phone || [],
    primaryPhone: data.primaryPhone || data.phone?.[0] || '',
    secondaryPhone: data.secondaryPhone || data.phone?.[1] || '',
    coverageStates: data.coverageStates || [],
    footerLinks: data.footerLinks?.length ? data.footerLinks : defaultSettings.footerLinks,
    contactQuickLinks: data.contactQuickLinks || [],
    inquiryForm: {
      ...defaultSettings.inquiryForm,
      ...(data.inquiryForm || {}),
      fields: { ...defaultSettings.inquiryForm.fields, ...(data.inquiryForm?.fields || {}) },
      labels: { ...defaultSettings.inquiryForm.labels, ...(data.inquiryForm?.labels || {}) },
    },
    seo: { ...defaultSettings.seo, ...(data.seo || {}) },
  };
}

export default function AdminSettingsPage() {
  const { data, mutate } = useSWR('/api/settings', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<typeof defaultSettings | null>(null);
  const [uploading, setUploading] = useState(false);

  const settings = draft ?? normalizeSettings(data);

  async function save() {
    const payload = {
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

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: fd,
    });
    setUploading(false);
    if (!res.ok) return;
    const { url } = await res.json();
    setDraft({ ...settings, logo: url });
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Contact & Business Settings</h1>

        <div className="glass space-y-3 rounded-2xl border border-white/10 p-4">
          <h3 className="font-semibold text-white">Business identity</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Company name" value={settings.companyName} onChange={(e) => setDraft({ ...settings, companyName: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Logo URL" value={settings.logo} onChange={(e) => setDraft({ ...settings, logo: e.target.value })} />
            <div className="flex items-center gap-3 md:col-span-2">
              <input type="file" onChange={handleLogoUpload} className="text-xs text-slate-200" />
              {uploading && <span className="text-xs text-emerald-300">Uploading…</span>}
            </div>
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Primary phone" value={settings.primaryPhone} onChange={(e) => setDraft({ ...settings, primaryPhone: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Secondary phone" value={settings.secondaryPhone} onChange={(e) => setDraft({ ...settings, secondaryPhone: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="WhatsApp number" value={settings.whatsappNumber} onChange={(e) => setDraft({ ...settings, whatsappNumber: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Email" value={settings.email} onChange={(e) => setDraft({ ...settings, email: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" placeholder="Address" value={settings.address} onChange={(e) => setDraft({ ...settings, address: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Website" value={settings.website} onChange={(e) => setDraft({ ...settings, website: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Map link" value={settings.mapLink} onChange={(e) => setDraft({ ...settings, mapLink: e.target.value })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Footer description" value={settings.footerDescription} onChange={(e) => setDraft({ ...settings, footerDescription: e.target.value })} />
          </div>
        </div>

        <div className="glass space-y-3 rounded-2xl border border-white/10 p-4">
          <h3 className="font-semibold text-white">CTA & quick links</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Header CTA label" value={settings.headerCtaLabel} onChange={(e) => setDraft({ ...settings, headerCtaLabel: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Header CTA target" value={settings.headerCtaTarget} onChange={(e) => setDraft({ ...settings, headerCtaTarget: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Contact CTA label" value={settings.contactCtaLabel} onChange={(e) => setDraft({ ...settings, contactCtaLabel: e.target.value })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Floating support label" value={settings.floatingSupportLabel} onChange={(e) => setDraft({ ...settings, floatingSupportLabel: e.target.value })} />
          </div>
          <textarea
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            rows={5}
            placeholder="Quick links: label|type|value|href(optional) one per line"
            value={settings.contactQuickLinks.map((item: QuickLink) => [item.label, item.type, item.value, item.href || ''].join('|')).join('\n')}
            onChange={(e) =>
              setDraft({
                ...settings,
                contactQuickLinks: e.target.value
                  .split('\n')
                  .map((line: string, index: number) => {
                    const [label, type, value, href] = line.split('|').map((part) => part.trim());
                    if (!label || !type || !value) return null;
                    return { label, type, value, href, active: true, sortOrder: index };
                  })
                  .filter(Boolean) as typeof settings.contactQuickLinks,
              })
            }
          />
          <textarea
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            rows={4}
            placeholder="Footer links: label|href one per line"
            value={settings.footerLinks.map((item: FooterLink) => `${item.label}|${item.href}`).join('\n')}
            onChange={(e) =>
              setDraft({
                ...settings,
                footerLinks: e.target.value
                  .split('\n')
                  .map((line: string) => {
                    const [label, href] = line.split('|').map((part) => part.trim());
                    return label && href ? { label, href } : null;
                  })
                  .filter(Boolean) as typeof settings.footerLinks,
              })
            }
          />
        </div>

        <div className="glass space-y-3 rounded-2xl border border-white/10 p-4">
          <h3 className="font-semibold text-white">Inquiry form</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Inquiry heading" value={settings.inquiryForm.heading} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, heading: e.target.value } })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Submit button label" value={settings.inquiryForm.labels.submit} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, labels: { ...settings.inquiryForm.labels, submit: e.target.value } } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Inquiry help text" value={settings.inquiryForm.description} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, description: e.target.value } })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-200">
            {(Object.entries(settings.inquiryForm.fields) as [InquiryFieldKey, boolean][]).map(([field, enabled]) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) =>
                    setDraft({
                      ...settings,
                      inquiryForm: {
                        ...settings.inquiryForm,
                        fields: { ...settings.inquiryForm.fields, [field as InquiryFieldKey]: e.target.checked },
                      },
                    })
                  }
                />
                Show {field}
              </label>
            ))}
          </div>
        </div>

        <button onClick={save} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
          Save settings
        </button>
      </div>
    </AdminShell>
  );
}
