'use client';
import useSWR from 'swr';
import { AdminShell } from '@/components/AdminShell';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminInquiriesPage() {
  const { data } = useSWR('/api/inquiries', fetcher);

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Inquiries</h1>
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Company</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Interest</th>
                <th className="p-3">Message</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((i: any) => (
                <tr key={i._id} className="border-t border-white/5">
                  <td className="p-3 text-white">{i.name}</td>
                  <td className="p-3 text-slate-300">{i.company}</td>
                  <td className="p-3 text-slate-300 text-xs break-all">
                    {i.phone}<br />{i.email}
                  </td>
                  <td className="p-3 text-slate-300">{i.productInterest}</td>
                  <td className="p-3 text-slate-300">{i.message}</td>
                  <td className="p-3 text-slate-300">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
