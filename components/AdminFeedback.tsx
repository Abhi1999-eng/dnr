'use client';

type AdminFeedbackProps = {
  type: 'success' | 'error';
  message: string;
};

export function AdminFeedback({ type, message }: AdminFeedbackProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${
        type === 'success'
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
          : 'border-red-400/30 bg-red-400/10 text-red-100'
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
