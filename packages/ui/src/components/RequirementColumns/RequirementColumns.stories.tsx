import type { Meta, StoryObj } from '@storybook/react';

import { RequirementColumns } from './RequirementColumns';

const meta = {
  title: 'Content/RequirementColumns',
  component: RequirementColumns,
  args: {
    columns: [
      { title: 'Functional', items: ['Keep the public contract', 'Ship weekly'] },
      { title: 'Non-functional', items: ['Bundle under 280kB gzip'] },
    ],
  },
} satisfies Meta<typeof RequirementColumns>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoColumns: Story = {};

export const Single: Story = {
  args: {
    columns: [{ title: 'Functional', items: ['Keep the public contract'] }],
  },
};
