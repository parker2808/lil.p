import type { Meta, StoryObj } from '@storybook/react';

const QA = 'Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}';

const ROWS = [
  {
    name: 'text-display',
    figma: 'Public/display · 64',
    className: 'font-heading text-display font-bold tracking-tight',
  },
  {
    name: 'text-title',
    figma: 'Public/title · 48',
    className: 'font-heading text-title font-bold',
  },
  {
    name: 'text-heading',
    figma: 'Public/heading · 30',
    className: 'font-heading text-heading font-semibold',
  },
  {
    name: 'text-subheading',
    figma: 'Public/subheading · 20',
    className: 'font-heading text-subheading font-semibold',
  },
  { name: 'text-prose', figma: 'Public/prose · 18', className: 'text-prose' },
  { name: 'text-body', figma: 'Public/body · 16', className: 'text-body' },
  { name: 'text-meta', figma: 'Public/meta · 14', className: 'text-meta font-medium' },
  {
    name: 'text-eyebrow',
    figma: 'Public/eyebrow · 12',
    className: 'font-mono text-eyebrow font-medium uppercase text-primary',
  },
  { name: 'text-ui-title', figma: 'Admin/ui-title · 20', className: 'text-ui-title font-semibold' },
  { name: 'text-ui', figma: 'Admin/ui · 14', className: 'text-ui' },
  { name: 'text-ui-meta', figma: 'Admin/ui-meta · 12.5', className: 'text-ui-meta font-medium' },
] as const;

function Typography() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-heading font-semibold">Type scale</h1>
        <p className="text-meta text-muted-foreground">
          Eleven named sizes. QA string checks Vietnamese marks and 0O / 1lI.
        </p>
      </header>
      <ul className="flex flex-col">
        {ROWS.map((row) => (
          <li
            key={row.name}
            className="border-border flex flex-col gap-3 border-b py-4 md:flex-row"
          >
            <div className="flex w-full shrink-0 flex-col gap-1 md:w-56">
              <span className="text-meta font-mono font-medium">{row.name}</span>
              <span className="text-ui-meta text-muted-foreground">{row.figma}</span>
            </div>
            <p className={row.className}>{QA}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const meta = {
  title: 'Foundations/Typography',
  component: Typography,
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
