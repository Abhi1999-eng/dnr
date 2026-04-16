'use client';
import { AdminShell } from '@/components/AdminShell';
import { useState } from 'react';

export default function MediaPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dnr_token') : '';
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('Uploading...');
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' }, body: formData });
    if (!res.ok) {
      setStatus('Upload failed');
      return;
    }
    const data = await res.json();
    setUrl(data.url);
    setStatus('Uploaded');
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-white">Media</h1>
        <form onSubmit={handleUpload} className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <input name="file" type="file" className="text-sm text-slate-300" />
          <button type="submit" className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold">
            Upload
          </button>
          {status && <p className="text-slate-400 text-sm">{status}</p>}
          {url && (
            <div className="text-xs text-slate-300 break-all">
              URL: <span className="text-white">{url}</span>
            </div>
          )}
        </form>
      </div>
    </AdminShell>
  );

}



