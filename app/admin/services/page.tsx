'use client';
import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminServicesPage() {
  const { data, mutate } = useSWR('/api/services', fetcher);
  const [form, setForm] = useState({ title: '', description: '', image: '' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';

  async function saveService() {
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', description: '', image: '' });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/services/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
    mutate();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Services</h1>
        <div className="glass p-4 rounded-2xl border border-white/10 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button onClick={saveService} className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
            Add
          </button>
        </div>
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Description</th>
                <th className="p-3">Image</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((s: any) => (
                <tr key={s._id} className="border-t border-white/5">
                  <td className="p-3 text-white">{s.title}</td>
                  <td className="p-3 text-slate-300">{s.description}</td>
                  <td className="p-3 text-slate-400 text-xs break-all">{s.image}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => remove(s._id)} className="text-red-400 text-sm">
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
