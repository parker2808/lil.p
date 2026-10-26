import { Button } from '@portfolio/ui/components/ui/button';
import type { Meta, StoryObj } from '@storybook/react';

import { CtaBand } from './CtaBand';

const meta = {
  title: 'Atmosphere/CtaBand',
  component: CtaBand,
} satisfies Meta<typeof CtaBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Let’s ship the next one together',
    intro: 'Available for staff-plus frontend work.',
    actions: <Button>Contact</Button>,
  },
};
