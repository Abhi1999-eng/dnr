export function SectionTitle({ kicker, title, eyebrow }: { kicker?: string; title: string; eyebrow?: string }) {
  return (
    <div className="space-y-1.5">
      {eyebrow && <span className="text-[11px] uppercase tracking-[0.18em] text-accent/80">{eyebrow}</span>}
      <h2 className="text-2xl font-semibold text-secondary md:text-[2rem] lg:text-[2.35rem]">{title}</h2>
      {kicker && <p className="max-w-2xl text-sm leading-relaxed text-secondary/80 md:text-[0.95rem]">{kicker}</p>}
    </div>
  );
}
