import type { Meta, StoryObj } from '@storybook/react';

import { KickerPill } from './KickerPill';

const meta = {
  title: 'Primitives/KickerPill',
  component: KickerPill,
} satisfies Meta<typeof KickerPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Available for staff-plus work' },
};

export const HiddenWhenEmpty: Story = {
  args: { children: undefined },
};
