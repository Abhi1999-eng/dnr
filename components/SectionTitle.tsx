import { Reveal } from './Reveal';

export function SectionTitle({
  kicker,
  title,
  eyebrow,
  theme = 'light',
}: {
  kicker?: string;
  title: string;
  eyebrow?: string;
  theme?: 'light' | 'dark';
}) {
  const isDark = theme === 'dark';

  return (
    <Reveal>
      <div className="space-y-2">
        {eyebrow ? (
          <span
            className={isDark ? 'text-[11px] uppercase tracking-[0.22em] text-[#7ed321]/85' : 'text-[11px] uppercase tracking-[0.18em] text-accent/80'}
          >
            {eyebrow}
          </span>
        ) : null}
        <h2 className={isDark ? 'text-[1.8rem] font-semibold text-white md:text-[1.95rem] lg:text-[2.15rem]' : 'text-[1.8rem] font-semibold text-secondary md:text-[1.95rem] lg:text-[2.15rem]'}>{title}</h2>
        {kicker ? (
          <p className={isDark ? 'max-w-2xl text-sm leading-6 text-[#aab4bd] md:text-[0.92rem]' : 'max-w-2xl text-sm leading-6 text-secondary/80 md:text-[0.92rem]'}>{kicker}</p>
        ) : null}
      </div>
    </Reveal>
  );
}
