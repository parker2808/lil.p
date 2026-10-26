import type { Meta, StoryObj } from '@storybook/react';

const SPACES = [
  { token: '0', className: 'w-0', px: '0' },
  { token: '0.5', className: 'w-0.5', px: '2' },
  { token: '1', className: 'w-1', px: '4' },
  { token: '1.5', className: 'w-1.5', px: '6' },
  { token: '2', className: 'w-2', px: '8' },
  { token: '3', className: 'w-3', px: '12' },
  { token: '4', className: 'w-4', px: '16' },
  { token: '5', className: 'w-5', px: '20' },
  { token: '6', className: 'w-6', px: '24' },
  { token: '8', className: 'w-8', px: '32' },
  { token: '10', className: 'w-10', px: '40' },
  { token: '12', className: 'w-12', px: '48' },
  { token: '16', className: 'w-16', px: '64' },
  { token: '24', className: 'w-24', px: '96' },
  { token: '32', className: 'w-32', px: '128' },
] as const;

const RADII = [
  { token: 'rounded-sm', className: 'rounded-sm', note: '4px' },
  { token: 'rounded-md', className: 'rounded-md', note: '6px' },
  { token: 'rounded-lg', className: 'rounded-lg', note: '8px' },
  { token: 'rounded-xl', className: 'rounded-xl', note: '12px' },
  { token: 'rounded-full', className: 'rounded-full', note: 'full' },
] as const;

const SHADOWS = [
  { token: 'shadow-1', className: 'shadow-1', note: 'sticky header' },
  { token: 'shadow-2', className: 'shadow-2', note: 'popover, card hover' },
  { token: 'shadow-3', className: 'shadow-3', note: 'dialog' },
] as const;

function Spacing() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="font-heading text-heading font-semibold">Spacing · 4px base</h1>
        <ul className="flex flex-col gap-2">
          {SPACES.map((row) => (
            <li key={row.token} className="flex items-center gap-4">
              <span className="text-ui-meta text-muted-foreground w-16 font-mono">{row.token}</span>
              <span className="text-ui-meta text-muted-foreground w-12 font-mono">{row.px}px</span>
              <div className={`bg-primary h-4 ${row.className}`} />
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-subheading font-semibold">Radius</h2>
        <div className="flex flex-wrap gap-6">
          {RADII.map((row) => (
            <div
              key={row.token}
              className={`border-primary bg-primary-subtle text-ui-meta text-primary-subtle-foreground flex h-20 w-28 items-end border p-2 font-mono ${row.className}`}
            >
              {row.token} · {row.note}
            </div>
          ))}
        </div>
      </section>
      <section className="bg-band flex flex-col gap-4 rounded-lg p-6">
        <h2 className="font-heading text-subheading font-semibold">Shadows</h2>
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map((row) => (
            <div
              key={row.token}
              className={`bg-card text-ui-meta text-muted-foreground h-28 w-48 rounded-lg p-3 font-mono ${row.className}`}
            >
              {row.token} · {row.note}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Spacing',
  component: Spacing,
} satisfies Meta<typeof Spacing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
