'use client';
import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminTestimonialsPage() {
  const { data, mutate } = useSWR('/api/testimonials', fetcher);
  const [form, setForm] = useState({ name: '', feedback: '', rating: 5 });
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

  async function save() {
    await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', feedback: '', rating: 5 });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Testimonials</h1>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Rating (1-5)"
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 md:col-span-1"
              placeholder="Feedback"
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            />
          </div>
          <button onClick={save} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
            Add
          </button>
        </div>
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Feedback</th>
                <th className="p-3">Rating</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((t: any) => (
                <tr key={t._id} className="border-t border-white/5">
                  <td className="p-3 text-white">{t.name}</td>
                  <td className="p-3 text-slate-300">{t.feedback}</td>
                  <td className="p-3 text-slate-300">{t.rating}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(t._id)} className="text-red-400 text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
