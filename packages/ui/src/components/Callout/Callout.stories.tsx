import type { Meta, StoryObj } from '@storybook/react';

import { Callout } from './Callout';

const meta = {
  title: 'Content/Callout',
  component: Callout,
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Note: Story = {
  args: {
    kind: 'NOTE',
    title: 'Note',
    children: <p>A note callout.</p>,
  },
};

export const Warning: Story = {
  args: {
    kind: 'WARNING',
    title: 'Warning',
    children: <p>A warning callout.</p>,
  },
};
