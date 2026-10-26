import { postFixture, viPostFixture } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { PostCard } from './PostCard';

const meta = {
  title: 'Cards/PostCard',
  component: PostCard,
  args: {
    href: '/notes/sample-note',
    dateLabel: 'Oct 12',
    labels: { minutes: 'min' },
  },
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  args: { post: postFixture },
};

export const Featured: Story = {
  args: { post: postFixture, variant: 'featured' },
};

export const Vietnamese: Story = {
  args: { post: viPostFixture, dateLabel: '12 thg 10' },
};
