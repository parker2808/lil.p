import type { Meta, StoryObj } from '@storybook/react';

const EASINGS = [
  { token: 'ease-out', className: 'ease-out', note: 'entering' },
  { token: 'ease-in', className: 'ease-in', note: 'leaving' },
  { token: 'ease-in-out', className: 'ease-in-out', note: 'moving' },
] as const;

function Motion() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="font-heading text-heading font-semibold">Easings</h1>
        <p className="text-meta text-muted-foreground">
          Hover a bar. Durations come from tokens. Under reduced motion they collapse to 0.01ms.
        </p>
        <ul className="flex flex-col gap-4">
          {EASINGS.map((row) => (
            <li key={row.token} className="flex flex-col gap-2">
              <span className="text-meta font-mono">
                {row.token} · {row.note}
              </span>
              <div className="bg-muted overflow-hidden rounded-md p-2">
                <div
                  className={`bg-primary h-8 w-16 rounded-md transition-transform ${row.className} hover:translate-x-24`}
                  style={{ transitionDuration: 'var(--dur-slow)' }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-subheading font-semibold">Reduced motion</h2>
        <p className="text-body text-muted-foreground max-w-prose">
          `@media (prefers-reduced-motion: reduce)` sets `--dur-instant`, `--dur-base` and
          `--dur-slow` to 0.01ms and stops `.marquee-track`, `.orb` and `.diagram-pulse`. Theme
          switching never animates (`disableTransitionOnChange`).
        </p>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Motion',
  component: Motion,
} satisfies Meta<typeof Motion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
