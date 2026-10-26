import type { Meta, StoryObj } from '@storybook/react';

import { CoverPlaceholder } from './CoverPlaceholder';

const meta = {
  title: 'Cards/CoverPlaceholder',
  component: CoverPlaceholder,
} satisfies Meta<typeof CoverPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Amber: Story = { args: { hue: 'AMBER' } };
export const Blue: Story = { args: { hue: 'BLUE' } };
export const Violet: Story = { args: { hue: 'VIOLET' } };
