export function SectionTitle({ kicker, title, eyebrow }: { kicker?: string; title: string; eyebrow?: string }) {
  return (
    <div className="space-y-2">
      {eyebrow && <span className="text-xs uppercase tracking-[0.2em] text-accent/80">{eyebrow}</span>}
      <h2 className="text-3xl md:text-4xl font-semibold text-secondary">{title}</h2>
      {kicker && <p className="text-secondary/80 max-w-2xl">{kicker}</p>}
    </div>
  );
}
