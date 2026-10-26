import type { Meta, StoryObj } from '@storybook/react';

import { StatCard } from './StatCard';

const meta = {
  title: 'Admin/StatCard',
  component: StatCard,
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Up: Story = {
  args: {
    label: 'Published',
    value: 2,
    delta: { direction: 'up', text: '+2 vs previous 30d' },
  },
};

export const Down: Story = {
  args: {
    label: 'Drafts',
    value: 1,
    delta: { direction: 'down', text: '−1 vs previous 30d' },
  },
};

export const Flat: Story = {
  args: {
    label: 'Projects',
    value: 0,
    delta: { direction: 'flat', text: 'same as previous 30d' },
  },
};
