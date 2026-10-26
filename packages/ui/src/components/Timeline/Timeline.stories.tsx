import { experienceFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { Timeline } from './Timeline';

const meta = {
  title: 'Content/Timeline',
  component: Timeline,
  args: {
    items: experienceFixtures,
    pageLocale: 'en',
    labels: { now: 'now', highlights: 'Highlights', fallback: 'EN' },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
