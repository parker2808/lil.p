import type { Meta, StoryObj } from '@storybook/react';

import { StatusPill } from './StatusPill';

const LABELS = { draft: 'Draft', published: 'Published', archived: 'Archived' };

const meta = {
  title: 'States/StatusPill',
  component: StatusPill,
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: { status: 'draft', labels: LABELS },
  render: () => (
    <div className="flex gap-2">
      <StatusPill status="draft" labels={LABELS} />
      <StatusPill status="published" labels={LABELS} />
      <StatusPill status="archived" labels={LABELS} />
    </div>
  ),
};
