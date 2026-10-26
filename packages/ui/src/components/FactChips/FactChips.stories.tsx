import type { Meta, StoryObj } from '@storybook/react';

import { FactChips } from './FactChips';

const meta = {
  title: 'Cards/FactChips',
  component: FactChips,
} satisfies Meta<typeof FactChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chips: ['Stack A → Stack B', '0 downtime', '6 months'],
  },
};
