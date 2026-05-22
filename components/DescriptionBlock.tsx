"use client";

import { useState } from 'react';

type Props = {
  content: string;
  maxPreview?: number;
  theme?: 'light' | 'dark';
};

export function DescriptionBlock({ content, maxPreview = 240, theme = 'light' }: Props) {
  const full = (content || '').trim();
  const needsToggle = full.length > maxPreview;
  const [expanded, setExpanded] = useState(false);
  const preview = needsToggle ? `${full.slice(0, maxPreview)}…` : full;
  const show = expanded || !needsToggle ? full : preview;

  if (!full) return null;

  return (
    <div className="space-y-1.5">
      <p className={theme === 'dark' ? 'leading-relaxed text-slate-300' : 'leading-relaxed text-secondary/80'}>{show}</p>
      {needsToggle && (
        <button onClick={() => setExpanded((v) => !v)} className={theme === 'dark' ? 'text-sm font-semibold text-[#7ed321]' : 'text-primary font-semibold text-sm'}>
          {expanded ? 'View less' : 'View more'}
        </button>
      )}
    </div>
  );
}
