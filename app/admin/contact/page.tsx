'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { ContactActionType, resolveContactActionHref } from '@/lib/contact-actions';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type QuickLink = { label: string; type: string; value: string; href?: string; active?: boolean; sortOrder?: number };

type ContactSettings = {
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  headerCtaLabel: string;
  headerCtaActionType: ContactActionType;
  headerCtaValue: string;
  floatingSupportEnabled: boolean;
  floatingSupportLabel: string;
  contactQuickLinks: QuickLink[];
  inquiryForm: {
    heading: string;
    description: string;
    fields: { name: boolean; company: boolean; phone: boolean; email: boolean; productInterest: boolean; message: boolean };
    labels: { name: string; company: string; phone: string; email: string; productInterest: string; message: string; submit: string };
  };
};

const defaultSettings: ContactSettings = {
  primaryPhone: '',
  secondaryPhone: '',
  whatsappNumber: '',
  email: '',
  address: '',
  headerCtaLabel: 'Talk to an Expert',
  headerCtaActionType: 'scroll',
  headerCtaValue: '#contact',
  floatingSupportEnabled: true,
  floatingSupportLabel: 'WhatsApp Support',
  contactQuickLinks: [],
  inquiryForm: {
    heading: 'Talk to an expert',
    description: '',
    fields: { name: true, company: true, phone: true, email: true, productInterest: true, message: true },
    labels: { name: 'Name', company: 'Company', phone: 'Phone', email: 'Email', productInterest: 'Product interest', message: 'Message', submit: 'Send inquiry' },
  },
};

function normalizeSettings(data: any): ContactSettings {
  if (!data) return defaultSettings;
  return {
    ...defaultSettings,
    ...data,
    primaryPhone: data.primaryPhone || data.phone?.[0] || '',
    secondaryPhone: data.secondaryPhone || data.phone?.[1] || '',
    headerCtaActionType: data.headerCtaActionType || 'scroll',
    headerCtaValue: data.headerCtaValue || data.headerCtaTarget || '#contact',
    floatingSupportEnabled: data.floatingSupportEnabled !== false,
    contactQuickLinks: (data.contactQuickLinks || []).map((item: QuickLink, index: number) => ({
      label: item.label || '',
      type: item.type || 'phone',
      value: item.value || '',
      href: item.href || '',
      active: item.active !== false,
      sortOrder: item.sortOrder || index + 1,
    })),
    inquiryForm: {
      ...defaultSettings.inquiryForm,
      ...(data.inquiryForm || {}),
      fields: { ...defaultSettings.inquiryForm.fields, ...(data.inquiryForm?.fields || {}) },
      labels: { ...defaultSettings.inquiryForm.labels, ...(data.inquiryForm?.labels || {}) },
    },
  };
}

function addQuickLinkRow(settings: ContactSettings): ContactSettings {
  return {
    ...settings,
    contactQuickLinks: [
      ...settings.contactQuickLinks,
      { label: '', type: 'phone', value: '', href: '', active: true, sortOrder: settings.contactQuickLinks.length + 1 },
    ],
  };
}

export default function AdminContactPage() {
  const { data, mutate } = useSWR('/api/settings', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<ContactSettings | null>(null);

  const settings = useMemo(() => draft ?? normalizeSettings(data), [data, draft]);

  function updateQuickLink(index: number, patch: Partial<QuickLink>) {
    setDraft({
      ...settings,
      contactQuickLinks: settings.contactQuickLinks.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  }

  function removeQuickLink(index: number) {
    setDraft({
      ...settings,
      contactQuickLinks: settings.contactQuickLinks.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  async function save() {
    const headerCtaTarget = resolveContactActionHref(settings.headerCtaActionType, settings.headerCtaValue, '#contact');
    const payload = {
      ...data,
      ...settings,
      phone: [settings.primaryPhone, settings.secondaryPhone].filter(Boolean),
      headerCtaTarget,
      contactQuickLinks: settings.contactQuickLinks
        .map((item, index) => ({ ...item, sortOrder: index + 1 }))
        .filter((item) => item.label && item.value),
    };

    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(payload),
    });
    setDraft(null);
    mutate();
  }

  const ctaValueLabel =
    settings.headerCtaActionType === 'whatsapp'
      ? 'WhatsApp number'
      : settings.headerCtaActionType === 'phone'
        ? 'Phone number'
        : settings.headerCtaActionType === 'email'
          ? 'Email address'
          : settings.headerCtaActionType === 'custom'
            ? 'Custom link'
            : 'Section link';

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Contact Settings</h1>
          <p className="text-sm text-slate-400">Update the contact details and actions used in the header, floating WhatsApp button, inquiry area, and footer.</p>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Primary contact information</h2>
            <p className="text-sm text-slate-400">These details are reused across the website wherever contact information is shown.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200"><span>Primary phone</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.primaryPhone} onChange={(e) => setDraft({ ...settings, primaryPhone: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-slate-200"><span>Secondary phone</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.secondaryPhone} onChange={(e) => setDraft({ ...settings, secondaryPhone: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-slate-200"><span>WhatsApp number</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.whatsappNumber} onChange={(e) => setDraft({ ...settings, whatsappNumber: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-slate-200"><span>Email</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.email} onChange={(e) => setDraft({ ...settings, email: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2"><span>Address</span><textarea rows={2} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.address} onChange={(e) => setDraft({ ...settings, address: e.target.value })} /></label>
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Header call-to-action</h2>
            <p className="text-sm text-slate-400">Choose what should happen when someone clicks the main header button.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200"><span>Button label</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.headerCtaLabel} onChange={(e) => setDraft({ ...settings, headerCtaLabel: e.target.value })} /></label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Button action</span>
              <select className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.headerCtaActionType} onChange={(e) => setDraft({ ...settings, headerCtaActionType: e.target.value as ContactActionType })}>
                <option value="scroll">Scroll to inquiry section</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Call</option>
                <option value="email">Email</option>
                <option value="custom">Custom link</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>{ctaValueLabel}</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                value={settings.headerCtaValue}
                placeholder={settings.headerCtaActionType === 'scroll' ? '#contact' : ''}
                onChange={(e) => setDraft({ ...settings, headerCtaValue: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Floating WhatsApp button</h2>
            <p className="text-sm text-slate-400">Turn the floating support button on or off and update the label shown beside the icon.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white">
              <input type="checkbox" checked={settings.floatingSupportEnabled} onChange={(e) => setDraft({ ...settings, floatingSupportEnabled: e.target.checked })} />
              Enable floating WhatsApp button
            </label>
            <label className="space-y-2 text-sm text-slate-200"><span>Button label</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.floatingSupportLabel} onChange={(e) => setDraft({ ...settings, floatingSupportLabel: e.target.value })} /></label>
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Quick contact links</h2>
              <p className="text-sm text-slate-400">Add quick contact links shown in the inquiry section.</p>
            </div>
            <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white" onClick={() => setDraft(addQuickLinkRow(settings))}>
              Add link
            </button>
          </div>
          <div className="space-y-3">
            {settings.contactQuickLinks.length ? settings.contactQuickLinks.map((item, index) => (
              <div key={`${item.label}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_180px_1fr_1fr_auto]">
                <label className="space-y-2 text-sm text-slate-200"><span>Label</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2" value={item.label} onChange={(e) => updateQuickLink(index, { label: e.target.value })} /></label>
                <label className="space-y-2 text-sm text-slate-200"><span>Type</span><select className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2" value={item.type} onChange={(e) => updateQuickLink(index, { type: e.target.value, href: e.target.value === 'custom' ? item.href : '' })}><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="custom">Custom link</option></select></label>
                <label className="space-y-2 text-sm text-slate-200"><span>Value</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2" value={item.value} onChange={(e) => updateQuickLink(index, { value: e.target.value })} /></label>
                <label className="space-y-2 text-sm text-slate-200"><span>Optional custom URL</span><input className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2" value={item.href || ''} onChange={(e) => updateQuickLink(index, { href: e.target.value })} disabled={item.type !== 'custom'} /></label>
                <button type="button" className="self-end rounded-full border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200" onClick={() => removeQuickLink(index)}>Delete</button>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">No quick contact links added yet.</div>}
          </div>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Inquiry form text</h2>
            <p className="text-sm text-slate-400">These labels appear above and inside the inquiry form on the website.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200"><span>Section title</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.inquiryForm.heading} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, heading: e.target.value } })} /></label>
            <label className="space-y-2 text-sm text-slate-200"><span>Button label</span><input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.inquiryForm.labels.submit} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, labels: { ...settings.inquiryForm.labels, submit: e.target.value } } })} /></label>
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2"><span>Help text</span><textarea rows={3} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={settings.inquiryForm.description} onChange={(e) => setDraft({ ...settings, inquiryForm: { ...settings.inquiryForm, description: e.target.value } })} /></label>
          </div>
        </div>

        <button onClick={save} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
          Save contact settings
        </button>
      </div>
    </AdminShell>
  );
}
