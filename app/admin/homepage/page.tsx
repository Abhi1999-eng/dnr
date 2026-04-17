'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CardItem = { title: string; description: string; sortOrder?: number; active?: boolean };
type StatItem = { label: string; value: string; sortOrder?: number; active?: boolean };

type SectionKey =
  | 'products'
  | 'services'
  | 'whyChoose'
  | 'industries'
  | 'testimonials'
  | 'trust'
  | 'clients'
  | 'featuredMachines'
  | 'inquiry'
  | 'coverage';

const SECTION_LABELS: Record<SectionKey, string> = {
  products: 'Products',
  services: 'Services',
  whyChoose: 'Why Choose DNR',
  industries: 'Industries & Applications',
  testimonials: 'Testimonials',
  trust: 'Proof Section',
  clients: 'Associated Brands',
  featuredMachines: 'Featured Machines',
  inquiry: 'Inquiry Section',
  coverage: 'Coverage Section',
};

const defaultHomepage = {
  hero: {
    heading: '',
    subheading: '',
    ctaPrimary: '',
    ctaSecondary: '',
    tagline: '',
  },
  heroStats: [] as StatItem[],
  about: {
    heading: '',
    body: '',
    bullets: [] as string[],
  },
  why: [] as CardItem[],
  industries: [] as CardItem[],
  trustCards: [] as CardItem[],
  sections: {
    products: { visible: true, title: '', kicker: '', buttonLabel: '' },
    services: { visible: true, title: '', kicker: '' },
    whyChoose: { visible: true, title: '', kicker: '' },
    industries: { visible: true, title: '', kicker: '' },
    testimonials: { visible: true, title: '', kicker: '' },
    trust: { visible: true, title: '', kicker: '' },
    clients: { visible: true, title: '', kicker: '' },
    featuredMachines: { visible: true, title: '', kicker: '' },
    inquiry: { visible: true, title: '', kicker: '' },
    coverage: { visible: true, title: '', kicker: '', summaryTitle: '', summaryText: '' },
  },
};

function normalizeHomepage(data: any) {
  if (!data) return defaultHomepage;
  return {
    ...defaultHomepage,
    ...data,
    hero: { ...defaultHomepage.hero, ...(data.hero || {}) },
    about: { ...defaultHomepage.about, ...(data.about || {}), bullets: data.about?.bullets || [] },
    heroStats: (data.heroStats || []).map((item: StatItem, index: number) => ({ ...item, sortOrder: item.sortOrder || index + 1, active: item.active !== false })),
    why: (data.why || []).map((item: CardItem, index: number) => ({ ...item, sortOrder: item.sortOrder || index + 1, active: item.active !== false })),
    industries: (data.industries || []).map((item: CardItem, index: number) => ({ ...item, sortOrder: item.sortOrder || index + 1, active: item.active !== false })),
    trustCards: (data.trustCards || []).map((item: CardItem, index: number) => ({ ...item, sortOrder: item.sortOrder || index + 1, active: item.active !== false })),
    sections: {
      ...defaultHomepage.sections,
      ...(data.sections || {}),
      products: { ...defaultHomepage.sections.products, ...(data.sections?.products || {}) },
      services: { ...defaultHomepage.sections.services, ...(data.sections?.services || {}) },
      whyChoose: { ...defaultHomepage.sections.whyChoose, ...(data.sections?.whyChoose || {}) },
      industries: { ...defaultHomepage.sections.industries, ...(data.sections?.industries || {}) },
      testimonials: { ...defaultHomepage.sections.testimonials, ...(data.sections?.testimonials || {}) },
      trust: { ...defaultHomepage.sections.trust, ...(data.sections?.trust || {}) },
      clients: { ...defaultHomepage.sections.clients, ...(data.sections?.clients || {}) },
      featuredMachines: { ...defaultHomepage.sections.featuredMachines, ...(data.sections?.featuredMachines || {}) },
      inquiry: { ...defaultHomepage.sections.inquiry, ...(data.sections?.inquiry || {}) },
      coverage: { ...defaultHomepage.sections.coverage, ...(data.sections?.coverage || {}) },
    },
  };
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm text-slate-200">
      <span>{label}</span>
      <input className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextAreaInput({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm text-slate-200">
      <span>{label}</span>
      <textarea className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function AdminHomepagePage() {
  const { data, mutate } = useSWR('/api/homepage', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<typeof defaultHomepage | null>(null);

  const form = useMemo(() => draft ?? normalizeHomepage(data), [data, draft]);

  function setSection<K extends SectionKey>(key: K, patch: Partial<(typeof form.sections)[K]>) {
    setDraft({
      ...form,
      sections: {
        ...form.sections,
        [key]: { ...form.sections[key], ...patch },
      },
    });
  }

  function updateStat(index: number, patch: Partial<StatItem>) {
    setDraft({
      ...form,
      heroStats: form.heroStats.map((item: StatItem, itemIndex: number) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  }

  function addStat() {
    setDraft({
      ...form,
      heroStats: [...form.heroStats, { label: '', value: '', active: true, sortOrder: form.heroStats.length + 1 }],
    });
  }

  function removeStat(index: number) {
    setDraft({ ...form, heroStats: form.heroStats.filter((_: StatItem, itemIndex: number) => itemIndex !== index) });
  }

  function updateBullet(index: number, value: string) {
    setDraft({
      ...form,
      about: { ...form.about, bullets: form.about.bullets.map((bullet: string, bulletIndex: number) => (bulletIndex === index ? value : bullet)) },
    });
  }

  function addBullet() {
    setDraft({ ...form, about: { ...form.about, bullets: [...form.about.bullets, ''] } });
  }

  function removeBullet(index: number) {
    setDraft({ ...form, about: { ...form.about, bullets: form.about.bullets.filter((_: string, bulletIndex: number) => bulletIndex !== index) } });
  }

  function updateCardList(key: 'why' | 'industries' | 'trustCards', index: number, patch: Partial<CardItem>) {
    setDraft({
      ...form,
      [key]: form[key].map((item: CardItem, itemIndex: number) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  }

  function addCard(key: 'why' | 'industries' | 'trustCards') {
    setDraft({
      ...form,
      [key]: [...form[key], { title: '', description: '', active: true, sortOrder: form[key].length + 1 }],
    });
  }

  function removeCard(key: 'why' | 'industries' | 'trustCards', index: number) {
    setDraft({
      ...form,
      [key]: form[key].filter((_: CardItem, itemIndex: number) => itemIndex !== index),
    });
  }

  async function save() {
    await fetch('/api/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({
        ...data,
        ...form,
        heroStats: form.heroStats.map((item: StatItem, index: number) => ({ ...item, sortOrder: index + 1 })),
        why: form.why.map((item: CardItem, index: number) => ({ ...item, sortOrder: index + 1 })),
        industries: form.industries.map((item: CardItem, index: number) => ({ ...item, sortOrder: index + 1 })),
        trustCards: form.trustCards.map((item: CardItem, index: number) => ({ ...item, sortOrder: index + 1 })),
        sections: {
          ...form.sections,
          coverage: { ...form.sections.coverage, visible: true },
        },
      }),
    });
    setDraft(null);
    mutate();
  }

  function renderCardEditor(
    key: 'why' | 'industries' | 'trustCards',
    title: string,
    description: string,
    emptyText: string
  ) {
    const items = form[key];
    return (
      <SectionCard title={title} description={description}>
        <div className="space-y-3">
          {items.length ? (
            items.map((item: CardItem, index: number) => (
              <div key={`${key}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_1.4fr_140px_auto]">
                <TextInput label="Title" value={item.title} onChange={(value) => updateCardList(key, index, { title: value })} />
                <TextAreaInput label="Description" value={item.description} onChange={(value) => updateCardList(key, index, { description: value })} rows={2} />
                <div className="self-end">
                  <Toggle label="Show item" checked={item.active !== false} onChange={(value) => updateCardList(key, index, { active: value })} />
                </div>
                <button type="button" className="self-end rounded-full border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200" onClick={() => removeCard(key, index)}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">{emptyText}</div>
          )}
        </div>
        <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white" onClick={() => addCard(key)}>
          Add item
        </button>
      </SectionCard>
    );
  }

  function renderSectionSettings(key: SectionKey, extraFields?: ReactNode, allowVisibility = true) {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">{SECTION_LABELS[key]}</h3>
            <p className="text-xs text-slate-400">Edit the title and supporting text for this homepage section.</p>
          </div>
          {allowVisibility ? (
            <Toggle label="Show section" checked={form.sections[key].visible} onChange={(value) => setSection(key, { visible: value } as any)} />
          ) : (
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-white">Always visible</div>
          )}
        </div>
        <div className="grid gap-3">
          <TextInput label="Section title" value={form.sections[key].title || ''} onChange={(value) => setSection(key, { title: value } as any)} />
          <TextAreaInput label="Section subtitle" value={form.sections[key].kicker || ''} onChange={(value) => setSection(key, { kicker: value } as any)} rows={2} />
          {extraFields}
        </div>
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Homepage Content</h1>
          <p className="text-sm text-slate-400">Update the homepage copy and featured content using simple business-friendly forms.</p>
        </div>

        <SectionCard title="Hero Section" description="Control the main heading, supporting copy, and headline buttons seen first on the homepage.">
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput label="Main heading" value={form.hero.heading} onChange={(value) => setDraft({ ...form, hero: { ...form.hero, heading: value } })} />
            <TextInput label="Top tagline" value={form.hero.tagline} onChange={(value) => setDraft({ ...form, hero: { ...form.hero, tagline: value } })} />
            <div className="md:col-span-2">
              <TextAreaInput label="Supporting description" value={form.hero.subheading} onChange={(value) => setDraft({ ...form, hero: { ...form.hero, subheading: value } })} />
            </div>
            <TextInput label="Primary button label" value={form.hero.ctaPrimary} onChange={(value) => setDraft({ ...form, hero: { ...form.hero, ctaPrimary: value } })} />
            <TextInput label="Secondary button label" value={form.hero.ctaSecondary} onChange={(value) => setDraft({ ...form, hero: { ...form.hero, ctaSecondary: value } })} />
          </div>
        </SectionCard>

        <SectionCard title="Hero Stats" description="Add short proof points such as coverage reach, machine range, or response promise.">
          <div className="space-y-3">
            {form.heroStats.length ? (
              form.heroStats.map((item: StatItem, index: number) => (
                <div key={`stat-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_1fr_140px_auto]">
                  <TextInput label="Label" value={item.label} onChange={(value) => updateStat(index, { label: value })} />
                  <TextInput label="Value" value={item.value} onChange={(value) => updateStat(index, { value })} />
                  <div className="self-end">
                    <Toggle label="Show stat" checked={item.active !== false} onChange={(value) => updateStat(index, { active: value })} />
                  </div>
                  <button type="button" className="self-end rounded-full border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200" onClick={() => removeStat(index)}>
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">No hero stats added yet.</div>
            )}
          </div>
          <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white" onClick={addStat}>
            Add stat
          </button>
        </SectionCard>

        <SectionCard title="About DNR" description="This content appears in the homepage introduction section.">
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput label="Section heading" value={form.about.heading} onChange={(value) => setDraft({ ...form, about: { ...form.about, heading: value } })} />
            <div className="md:col-span-2">
              <TextAreaInput label="Section description" value={form.about.body} onChange={(value) => setDraft({ ...form, about: { ...form.about, body: value } })} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">About bullet points</h3>
                <p className="text-sm text-slate-400">Add short support highlights shown as cards beside the intro text.</p>
              </div>
              <button type="button" className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white" onClick={addBullet}>
                Add bullet
              </button>
            </div>
            {form.about.bullets.length ? form.about.bullets.map((bullet: string, index: number) => (
              <div key={`bullet-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_auto]">
                <TextInput label={`Bullet ${index + 1}`} value={bullet} onChange={(value) => updateBullet(index, value)} />
                <button type="button" className="self-end rounded-full border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-200" onClick={() => removeBullet(index)}>
                  Delete
                </button>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-400">No about bullets added yet.</div>}
          </div>
        </SectionCard>

        {renderCardEditor('why', 'Why Choose DNR', 'Manage the benefit cards shown after products and services.', 'No “Why Choose DNR” items added yet.')}
        {renderCardEditor('industries', 'Industries & Applications', 'Manage the industry use-case cards shown on the homepage.', 'No industry cards added yet.')}
        {renderCardEditor('trustCards', 'Proof / Trust Cards', 'Manage the proof cards that reinforce trust and credibility.', 'No proof cards added yet.')}

        <SectionCard title="Section Titles & Visibility" description="Keep homepage sections clear and business-friendly. Coverage always stays visible on the website.">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderSectionSettings('products', <TextInput label="View all button label" value={form.sections.products.buttonLabel || ''} onChange={(value) => setSection('products', { buttonLabel: value })} />)}
            {renderSectionSettings('services')}
            {renderSectionSettings('whyChoose')}
            {renderSectionSettings('industries')}
            {renderSectionSettings('testimonials')}
            {renderSectionSettings('trust')}
            {renderSectionSettings('clients')}
            {renderSectionSettings('featuredMachines')}
            {renderSectionSettings('inquiry')}
            {renderSectionSettings(
              'coverage',
              <>
                <TextInput label="Summary card title" value={form.sections.coverage.summaryTitle || ''} onChange={(value) => setSection('coverage', { summaryTitle: value })} />
                <TextAreaInput label="Summary card description" value={form.sections.coverage.summaryText || ''} onChange={(value) => setSection('coverage', { summaryText: value })} rows={3} />
              </>,
              false
            )}
          </div>
        </SectionCard>

        <button onClick={save} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
          Save homepage content
        </button>
      </div>
    </AdminShell>
  );
}
