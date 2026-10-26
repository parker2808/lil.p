import type { Meta, StoryObj } from '@storybook/react';

import { Atmosphere } from './Atmosphere';

const meta = {
  title: 'Atmosphere/Atmosphere',
  component: Atmosphere,
} satisfies Meta<typeof Atmosphere>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
  args: { variant: 'hero', enabled: true },
  render: (args) => (
    <div className="bg-background relative h-64">
      <Atmosphere {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { variant: 'hero', enabled: false },
  render: (args) => (
    <div className="bg-background relative h-32">
      <Atmosphere {...args} />
    </div>
  ),
};
