import type { Meta, StoryObj } from '@storybook/react';

import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'Atmosphere/SectionHeader',
  component: SectionHeader,
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Selected work',
    intro: 'A few products I moved forward.',
    iconKey: 'briefcase',
  },
};
