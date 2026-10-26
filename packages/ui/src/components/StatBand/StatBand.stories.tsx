import { profileStatFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { StatBand } from './StatBand';

const meta = {
  title: 'Sections/StatBand',
  component: StatBand,
} satisfies Meta<typeof StatBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { stats: profileStatFixtures },
};

export const Compact: Story = {
  args: { stats: profileStatFixtures, variant: 'compact' },
};
