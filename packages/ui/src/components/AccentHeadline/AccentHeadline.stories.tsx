import type { Meta, StoryObj } from '@storybook/react';

import { AccentHeadline } from './AccentHeadline';

const meta = {
  title: 'Atmosphere/AccentHeadline',
  component: AccentHeadline,
} satisfies Meta<typeof AccentHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAccent: Story = {
  args: {
    text: 'I move products forward without breaking them.',
    accent: 'without breaking them.',
  },
};

export const Plain: Story = {
  args: { text: 'A plain headline', accent: 'missing' },
};
