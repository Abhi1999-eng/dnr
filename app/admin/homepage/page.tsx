'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CardItem = { title: string; description: string; sortOrder?: number; active?: boolean };
type StatItem = { label: string; value: string; sortOrder?: number; active?: boolean };

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
    categories: { visible: true, title: '', kicker: '', buttonLabel: '' },
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
    heroStats: data.heroStats || [],
    why: data.why || [],
    industries: data.industries || [],
    trustCards: data.trustCards || [],
    sections: {
      ...defaultHomepage.sections,
      ...(data.sections || {}),
      categories: { ...defaultHomepage.sections.categories, ...(data.sections?.categories || {}) },
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

function parseCardLines(value: string) {
  return value
    .split('\n')
    .map((line) => {
      const [title, description, sortOrder, active] = line.split('|').map((part) => part.trim());
      if (!title) return null;
      return {
        title,
        description: description || '',
        sortOrder: Number(sortOrder || 0),
        active: active !== 'false',
      };
    })
    .filter(Boolean) as CardItem[];
}

function cardLines(items: CardItem[] = []) {
  return items.map((item: CardItem) => [item.title, item.description || '', item.sortOrder || 0, item.active !== false ? 'true' : 'false'].join('|')).join('\n');
}

function statLines(items: StatItem[] = []) {
  return items.map((item: StatItem) => [item.label, item.value, item.sortOrder || 0, item.active !== false ? 'true' : 'false'].join('|')).join('\n');
}

export default function AdminHomepagePage() {
  const { data, mutate } = useSWR('/api/homepage', fetcher);
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [draft, setDraft] = useState<typeof defaultHomepage | null>(null);

  const form = draft ?? normalizeHomepage(data);

  async function save() {
    await fetch('/api/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ ...data, ...form }),
    });
    setDraft(null);
    mutate();
  }

  function sectionCard(
    key: keyof typeof defaultHomepage.sections,
    fields: Array<{ key: string; placeholder: string; multiline?: boolean }> = [
      { key: 'title', placeholder: 'Section title' },
      { key: 'kicker', placeholder: 'Section subtitle', multiline: true },
    ]
  ) {
    const section = form.sections[key] as Record<string, string | boolean | undefined>;
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-white">{String(key)}</h3>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={Boolean(section.visible)}
              onChange={(e) =>
                setDraft({
                  ...form,
                  sections: { ...form.sections, [key]: { ...section, visible: e.target.checked } as any },
                })
              }
            />
            Visible
          </label>
        </div>
        {fields.map((field) =>
          field.multiline ? (
            <textarea
              key={field.key}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2"
              placeholder={field.placeholder}
              value={String(section[field.key] || '')}
              onChange={(e) =>
                setDraft({
                  ...form,
                  sections: { ...form.sections, [key]: { ...section, [field.key]: e.target.value } as any },
                })
              }
            />
          ) : (
            <input
              key={field.key}
              className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2"
              placeholder={field.placeholder}
              value={String(section[field.key] || '')}
              onChange={(e) =>
                setDraft({
                  ...form,
                  sections: { ...form.sections, [key]: { ...section, [field.key]: e.target.value } as any },
                })
              }
            />
          )
        )}
      </div>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Homepage Content</h1>
          <p className="text-sm text-slate-400">Manage hero copy, section titles, trust cards, industries, about content, and section visibility without touching code.</p>
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Hero</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Heading" value={form.hero.heading} onChange={(e) => setDraft({ ...form, hero: { ...form.hero, heading: e.target.value } })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Tagline" value={form.hero.tagline} onChange={(e) => setDraft({ ...form, hero: { ...form.hero, tagline: e.target.value } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="Subheading" value={form.hero.subheading} onChange={(e) => setDraft({ ...form, hero: { ...form.hero, subheading: e.target.value } })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Primary CTA label" value={form.hero.ctaPrimary} onChange={(e) => setDraft({ ...form, hero: { ...form.hero, ctaPrimary: e.target.value } })} />
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="Secondary CTA label" value={form.hero.ctaSecondary} onChange={(e) => setDraft({ ...form, hero: { ...form.hero, ctaSecondary: e.target.value } })} />
          </div>
          <textarea
            className="min-h-28 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Hero stats: label|value|sortOrder|active one per line"
            value={statLines(form.heroStats)}
            onChange={(e) =>
              setDraft({
                ...form,
                heroStats: e.target.value
                  .split('\n')
                  .map((line: string) => {
                    const [label, value, sortOrder, active] = line.split('|').map((part) => part.trim());
                    if (!label || !value) return null;
                    return { label, value, sortOrder: Number(sortOrder || 0), active: active !== 'false' };
                  })
                  .filter(Boolean) as typeof form.heroStats,
              })
            }
          />
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">About & why choose DNR</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2" placeholder="About heading" value={form.about.heading} onChange={(e) => setDraft({ ...form, about: { ...form.about, heading: e.target.value } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={3} placeholder="About body" value={form.about.body} onChange={(e) => setDraft({ ...form, about: { ...form.about, body: e.target.value } })} />
            <textarea className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2" rows={4} placeholder="About bullets (one per line)" value={form.about.bullets.join('\n')} onChange={(e) => setDraft({ ...form, about: { ...form.about, bullets: e.target.value.split('\n').map((line: string) => line.trim()).filter(Boolean) } })} />
          </div>
          <textarea
            className="min-h-32 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Why choose cards: title|description|sortOrder|active one per line"
            value={cardLines(form.why)}
            onChange={(e) => setDraft({ ...form, why: parseCardLines(e.target.value) })}
          />
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Industries & proof content</h2>
          <textarea
            className="min-h-36 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Industries: title|description|sortOrder|active one per line"
            value={cardLines(form.industries)}
            onChange={(e) => setDraft({ ...form, industries: parseCardLines(e.target.value) })}
          />
          <textarea
            className="min-h-36 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            placeholder="Trust cards: title|description|sortOrder|active one per line"
            value={cardLines(form.trustCards)}
            onChange={(e) => setDraft({ ...form, trustCards: parseCardLines(e.target.value) })}
          />
        </div>

        <div className="glass space-y-4 rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white">Section visibility, titles, and labels</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {sectionCard('categories', [
              { key: 'title', placeholder: 'Categories title' },
              { key: 'kicker', placeholder: 'Categories subtitle', multiline: true },
              { key: 'buttonLabel', placeholder: 'View all label' },
            ])}
            {sectionCard('services')}
            {sectionCard('whyChoose')}
            {sectionCard('industries')}
            {sectionCard('testimonials')}
            {sectionCard('trust')}
            {sectionCard('clients')}
            {sectionCard('featuredMachines')}
            {sectionCard('inquiry')}
            {sectionCard('coverage', [
              { key: 'title', placeholder: 'Coverage title' },
              { key: 'kicker', placeholder: 'Coverage subtitle', multiline: true },
              { key: 'summaryTitle', placeholder: 'Coverage summary title' },
              { key: 'summaryText', placeholder: 'Coverage summary text', multiline: true },
            ])}
          </div>
        </div>

        <button onClick={save} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
          Save homepage content
        </button>
      </div>
    </AdminShell>
  );
}
