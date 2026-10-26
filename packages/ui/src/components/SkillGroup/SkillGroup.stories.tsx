import { skillsGroupedFixture } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { SkillGroup } from './SkillGroup';

const meta = {
  title: 'Sections/SkillGroup',
  component: SkillGroup,
} satisfies Meta<typeof SkillGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    groups: skillsGroupedFixture,
    labels: { daily: 'Daily', shipped: 'Shipped', growing: 'Growing' },
  },
};
