import type { Meta, StoryObj } from '@storybook/react';

import { Prose } from './Prose';

const meta = {
  title: 'Content/Prose',
  component: Prose,
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h2>Heading two</h2>
        <p>A paragraph at the reading measure.</p>
        <ul>
          <li>Bullet one</li>
          <li>Bullet two</li>
        </ul>
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    compact: true,
    children: <p>Compact prose used inside cards.</p>,
  },
};
