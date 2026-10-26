import type { Meta, StoryObj } from '@storybook/react';

import { KeyFacts } from './KeyFacts';

const meta = {
  title: 'Cards/KeyFacts',
  component: KeyFacts,
} satisfies Meta<typeof KeyFacts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hue: 'AMBER',
    facts: [
      'Zero downtime during the cutover.',
      'Contracts first, then the UI.',
      'Weekly ship from week one.',
      'One shared list query for every page.',
    ],
  },
};
