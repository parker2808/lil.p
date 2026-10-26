import type { Meta, StoryObj } from '@storybook/react';

import { ContentProgress } from './ContentProgress';

const meta = {
  title: 'Content/ContentProgress',
  component: ContentProgress,
} satisfies Meta<typeof ContentProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
