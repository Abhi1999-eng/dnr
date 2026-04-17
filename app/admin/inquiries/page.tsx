'use client';

import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';
import { AdminEmptyState } from '@/components/AdminEmptyState';

const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
};

export default function AdminInquiriesPage() {
  const { data, error, isLoading } = useSWR('/api/inquiries', fetcher);
  const inquiries = Array.isArray(data) ? data : [];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Inquiries</h1>
          <p className="text-sm text-slate-400">Lead capture submissions from the website will appear here once customers start contacting you.</p>
        </div>

        {isLoading ? (
          <div className="glass rounded-2xl border border-white/10 p-6 text-sm text-slate-300">Loading inquiries…</div>
        ) : error ? (
          <div className="glass rounded-2xl border border-red-400/20 p-6 text-sm text-red-200">Unable to load inquiries right now. Please refresh and try again.</div>
        ) : !inquiries.length ? (
          <AdminEmptyState title="No inquiries yet" description="Website inquiries will appear here once someone submits the contact form." />
        ) : (
          <div className="glass overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Interest</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((i: any) => (
                  <tr key={i._id} className="border-t border-white/10">
                    <td className="p-4 font-medium text-white">{i.name || '—'}</td>
                    <td className="p-4 text-slate-300">{i.company || '—'}</td>
                    <td className="p-4 text-xs text-slate-300">
                      <div className="space-y-1 break-all">
                        {i.phone ? <div>{i.phone}</div> : null}
                        {i.email ? <div>{i.email}</div> : null}
                        {!i.phone && !i.email ? '—' : null}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{i.productInterest || '—'}</td>
                    <td className="p-4 text-slate-300"><div className="max-w-md whitespace-pre-wrap break-words">{i.message || '—'}</div></td>
                    <td className="p-4 text-slate-300">{i.status || 'new'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
