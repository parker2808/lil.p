import type { Meta, StoryObj } from '@storybook/react';

import { DecisionCard } from './DecisionCard';

const meta = {
  title: 'Content/DecisionCard',
  component: DecisionCard,
  args: {
    title: 'Axios to TanStack Query',
    children: <p>Cache, retries and invalidation match ratings that must not go stale.</p>,
  },
} satisfies Meta<typeof DecisionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
