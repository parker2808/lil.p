import type { Meta, StoryObj } from '@storybook/react';

import { DiffStat } from './DiffStat';

const meta = {
  title: 'Cards/DiffStat',
  component: DiffStat,
} satisfies Meta<typeof DiffStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Value: Story = {
  args: { value: '5', label: 'years' },
};

export const Diff: Story = {
  args: { before: 'yes', after: 'no', label: 'Release freeze' },
};
