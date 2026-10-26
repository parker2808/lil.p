import type { Meta, StoryObj } from '@storybook/react';

import { NavLink } from './NavLink';

const meta = {
  title: 'Primitives/NavLink',
  component: NavLink,
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <nav className="flex gap-2">
      <NavLink href="#work" active>
        Work
      </NavLink>
      <NavLink href="#about">About</NavLink>
    </nav>
  ),
};
