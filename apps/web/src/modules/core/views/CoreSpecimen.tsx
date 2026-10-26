const QA = 'Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}';

const TYPE_ROWS = [
  {
    name: 'text-display',
    className: 'font-heading text-display font-bold tracking-tight',
    note: 'Public/display · 64',
  },
  { name: 'text-title', className: 'font-heading text-title font-bold', note: 'Public/title · 48' },
  {
    name: 'text-heading',
    className: 'font-heading text-heading font-semibold',
    note: 'Public/heading · 30',
  },
  {
    name: 'text-subheading',
    className: 'font-heading text-subheading font-semibold',
    note: 'Public/subheading · 20',
  },
  { name: 'text-prose', className: 'text-prose', note: 'Public/prose · 18' },
  { name: 'text-body', className: 'text-body', note: 'Public/body · 16' },
  { name: 'text-meta', className: 'text-meta font-medium', note: 'Public/meta · 14' },
  {
    name: 'text-eyebrow',
    className: 'font-mono text-eyebrow font-medium uppercase text-primary',
    note: 'Public/eyebrow · 12',
  },
  { name: 'text-ui-title', className: 'text-ui-title font-semibold', note: 'Admin/ui-title · 20' },
  { name: 'text-ui', className: 'text-ui', note: 'Admin/ui · 14' },
  { name: 'text-ui-meta', className: 'text-ui-meta font-medium', note: 'Admin/ui-meta · 12.5' },
] as const;

const CORE_SWATCHES = [
  'background',
  'foreground',
  'card',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'border',
  'input',
  'ring',
  'band',
] as const;

const HUE_SWATCHES = ['jade', 'amber', 'blue', 'violet', 'rose'] as const;

const SWATCH_BG: Record<(typeof CORE_SWATCHES)[number], string> = {
  background: 'bg-background',
  foreground: 'bg-foreground',
  card: 'bg-card',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  muted: 'bg-muted',
  accent: 'bg-accent',
  destructive: 'bg-destructive',
  border: 'bg-border',
  input: 'bg-input',
  ring: 'bg-ring',
  band: 'bg-band',
};

const HUE_BG: Record<(typeof HUE_SWATCHES)[number], { fill: string; tint: string }> = {
  jade: { fill: 'bg-hue-jade', tint: 'bg-hue-jade-subtle' },
  amber: { fill: 'bg-hue-amber', tint: 'bg-hue-amber-subtle' },
  blue: { fill: 'bg-hue-blue', tint: 'bg-hue-blue-subtle' },
  violet: { fill: 'bg-hue-violet', tint: 'bg-hue-violet-subtle' },
  rose: { fill: 'bg-hue-rose', tint: 'bg-hue-rose-subtle' },
};

export function CoreSpecimen() {
  return (
    <main
      className="mx-auto flex w-full flex-col gap-16 px-6 pb-24"
      style={{ maxWidth: 'var(--container)' }}
    >
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-primary font-mono font-medium uppercase">Foundations</p>
        <h1 className="font-heading text-title font-bold">Type and tokens</h1>
        <p className="text-prose text-muted-foreground" style={{ maxWidth: 'var(--measure)' }}>
          Temporary specimen for T05. Tokens come from{' '}
          <code className="text-meta font-mono">packages/ui</code>. T11 removes this page.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-heading font-semibold">Type scale</h2>
        <ul className="flex flex-col">
          {TYPE_ROWS.map((row) => (
            <li
              key={row.name}
              className="border-border flex flex-col gap-4 border-b py-4 md:flex-row"
            >
              <div className="flex w-full shrink-0 flex-col gap-1 md:w-56">
                <span className="text-meta font-mono font-medium">{row.name}</span>
                <span className="text-ui-meta text-muted-foreground">{row.note}</span>
              </div>
              <p className={row.className}>{QA}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-heading font-semibold">Color swatches</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CORE_SWATCHES.map((name) => (
            <div key={name} className="border-border bg-card overflow-hidden rounded-lg border">
              <div className={`h-14 ${SWATCH_BG[name]}`} />
              <p className="text-ui-meta px-2 py-2 font-mono">--{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-heading font-semibold">Band</h2>
        <div className="bg-band rounded-lg px-6 py-8">
          <p className="text-eyebrow text-primary font-mono font-medium uppercase">Band surface</p>
          <p className="text-prose text-muted-foreground">
            Alternating full-width section band. Body stays 16 / 1.6; prose stays 18 / 1.75.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-heading font-semibold">Domain hues</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {HUE_SWATCHES.map((name) => (
            <div key={name} className="border-border bg-card overflow-hidden rounded-lg border">
              <div className="flex">
                <div className={`h-14 flex-1 ${HUE_BG[name].fill}`} />
                <div className={`h-14 flex-1 ${HUE_BG[name].tint}`} />
              </div>
              <p className="text-ui-meta px-2 py-2 font-mono">--hue-{name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-heading font-semibold">Eyebrows</h2>
        <p className="text-eyebrow text-primary font-mono font-medium uppercase">Case study</p>
        <p className="text-eyebrow text-subtle-foreground font-mono font-medium uppercase">
          Outcome
        </p>
      </section>
    </main>
  );
}
