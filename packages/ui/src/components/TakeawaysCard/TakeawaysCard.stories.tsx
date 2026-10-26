import type { Meta, StoryObj } from '@storybook/react';

import { TakeawaysCard } from './TakeawaysCard';

const meta = {
  title: 'Content/TakeawaysCard',
  component: TakeawaysCard,
  args: {
    title: 'Key takeaways',
    items: [
      'Replace state; never mutate it in place.',
      'Derive during render before you reach for an effect.',
      'TanStack Query is the same job in Vue and React.',
    ],
  },
} satisfies Meta<typeof TakeawaysCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
