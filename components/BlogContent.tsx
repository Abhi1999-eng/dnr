import type { ReactNode } from 'react';

function sanitizeHref(href: string) {
  const trimmed = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  return '#';
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={sanitizeHref(match[3])}
          className="font-medium text-[#7ed321] underline decoration-[#7ed321]/30 underline-offset-4 transition hover:text-[#d5f4a8]"
          target={/^https?:/i.test(match[3]) ? '_blank' : undefined}
          rel={/^https?:/i.test(match[3]) ? 'noopener noreferrer' : undefined}
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={`${match.index}-strong`} className="font-semibold text-white">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      nodes.push(
        <code key={`${match.index}-code`} className="rounded bg-white/6 px-1.5 py-0.5 text-[0.95em] text-[#d5f4a8]">
          {match[5]}
        </code>
      );
    } else if (match[6]) {
      nodes.push(
        <em key={`${match.index}-em`} className="italic text-slate-100">
          {match[6]}
        </em>
      );
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function isUnorderedList(line: string) {
  return /^[-*]\s+/.test(line);
}

function isOrderedList(line: string) {
  return /^\d+\.\s+/.test(line);
}

export function BlogContent({ content }: { content: string }) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const commonClass = level === 1 ? 'text-3xl md:text-4xl' : level === 2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl';
      const HeadingTag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      blocks.push(
        <HeadingTag key={`heading-${index}`} className={`mt-8 font-semibold tracking-tight text-white first:mt-0 ${commonClass}`}>
          {renderInline(text)}
        </HeadingTag>
      );
      index += 1;
      continue;
    }

    if (isUnorderedList(line) || isOrderedList(line)) {
      const ordered = isOrderedList(line);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!(ordered ? isOrderedList(current) : isUnorderedList(current))) {
          break;
        }
        items.push(current.replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ''));
        index += 1;
      }

      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag
          key={`list-${index}`}
          className={`mt-5 space-y-3 pl-6 text-base leading-8 text-slate-300 ${ordered ? 'list-decimal' : 'list-disc marker:text-[#7ed321]'}`}
        >
          {items.map((item, itemIndex) => (
            <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current || /^(#{1,3})\s+/.test(current) || isUnorderedList(current) || isOrderedList(current)) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="mt-5 text-base leading-8 text-slate-300 first:mt-0">
        {renderInline(paragraphLines.join(' '))}
      </p>
    );
  }

  return <div className="blog-prose">{blocks}</div>;
}
