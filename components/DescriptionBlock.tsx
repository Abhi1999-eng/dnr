"use client";

import { useState } from 'react';

type Props = {
  content: string;
  maxPreview?: number;
};

export function DescriptionBlock({ content, maxPreview = 240 }: Props) {
  const full = (content || '').trim();
  const needsToggle = full.length > maxPreview;
  const [expanded, setExpanded] = useState(false);
  const preview = needsToggle ? `${full.slice(0, maxPreview)}…` : full;
  const show = expanded || !needsToggle ? full : preview;

  if (!full) return null;

  return (
    <div className="space-y-1">
      <p className="text-secondary/80 leading-relaxed">{show}</p>
      {needsToggle && (
        <button onClick={() => setExpanded((v) => !v)} className="text-primary font-semibold text-sm">
          {expanded ? 'View less' : 'View more'}
        </button>
      )}
    </div>
  );
}
