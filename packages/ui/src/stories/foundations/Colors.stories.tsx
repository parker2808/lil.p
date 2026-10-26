import type { Meta, StoryObj } from '@storybook/react';

const PAIR_ROWS = [
  {
    fg: 'text-foreground',
    bg: 'bg-background',
    label: 'foreground on background',
    ratio: '16.96 / 16.55',
  },
  {
    fg: 'text-card-foreground',
    bg: 'bg-card',
    label: 'card-foreground on card',
    ratio: '≥ 16 / ≥ 15',
  },
  {
    fg: 'text-popover-foreground',
    bg: 'bg-popover',
    label: 'popover-foreground on popover',
    ratio: '≥ 16 / 14.12',
  },
  {
    fg: 'text-muted-foreground',
    bg: 'bg-background',
    label: 'muted-foreground on background',
    ratio: '7.40 / 8.49',
  },
  {
    fg: 'text-subtle-foreground',
    bg: 'bg-background',
    label: 'subtle-foreground on background',
    ratio: '5.05 / 6.09',
  },
  {
    fg: 'text-primary-foreground',
    bg: 'bg-primary',
    label: 'primary-foreground on primary',
    ratio: '5.47 / 7.80',
  },
  {
    fg: 'text-primary',
    bg: 'bg-background',
    label: 'primary on background',
    ratio: '5.24 / 10.37',
  },
  {
    fg: 'text-destructive-foreground',
    bg: 'bg-destructive',
    label: 'destructive-foreground on destructive',
    ratio: '6.57 / 6.93',
  },
  {
    fg: 'text-success',
    bg: 'bg-success-subtle',
    label: 'success on success-subtle',
    ratio: '4.92 / 7.01',
  },
  {
    fg: 'text-warning',
    bg: 'bg-warning-subtle',
    label: 'warning on warning-subtle',
    ratio: '6.40 / 7.13',
  },
  { fg: 'text-info', bg: 'bg-info-subtle', label: 'info on info-subtle', ratio: '5.72 / 6.02' },
] as const;

const CORE = [
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

const CORE_BG: Record<(typeof CORE)[number], string> = {
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

function Colors() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="font-heading text-heading font-semibold">Contrast pairs (§3.1)</h1>
        <p className="text-meta text-muted-foreground">
          Measured light / dark. Text pairs are at least 4.5:1; large text 3:1.
        </p>
        <ul className="flex flex-col gap-2">
          {PAIR_ROWS.map((row) => (
            <li
              key={row.label}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${row.bg} ${row.fg}`}
            >
              <span className="text-body">{row.label}</span>
              <span className="text-meta font-mono">{row.ratio}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-subheading font-semibold">Token swatches</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CORE.map((name) => (
            <div key={name} className="border-border bg-card overflow-hidden rounded-lg border">
              <div className={`h-14 ${CORE_BG[name]}`} />
              <p className="text-ui-meta text-foreground px-2 py-2 font-mono">--{name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Colors',
  component: Colors,
} satisfies Meta<typeof Colors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
