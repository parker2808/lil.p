import type { Meta, StoryObj } from '@storybook/react';

import { SectionNav } from './SectionNav';

const meta = {
  title: 'Content/SectionNav',
  component: SectionNav,
  args: {
    label: 'On this page',
    items: [
      { id: 'heading-two', title: 'Heading two', depth: 2 },
      { id: 'heading-three', title: 'Heading three', depth: 3 },
    ],
  },
} satisfies Meta<typeof SectionNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
