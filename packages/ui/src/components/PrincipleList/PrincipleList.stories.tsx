import { principleFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { PrincipleList } from './PrincipleList';

const meta = {
  title: 'Sections/PrincipleList',
  component: PrincipleList,
} satisfies Meta<typeof PrincipleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { principles: principleFixtures },
};
