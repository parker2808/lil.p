import { processStepFixtures, skillChipFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { MigrationDiagram } from './MigrationDiagram';

const meta = {
  title: 'Sections/MigrationDiagram',
  component: MigrationDiagram,
  args: {
    label: 'Migration from v1 to v2',
  },
} satisfies Meta<typeof MigrationDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    versionFrom: 'v1',
    versionTo: 'v2',
    skills: skillChipFixtures.slice(0, 6),
  },
};

export const FewerSkills: Story = {
  args: {
    versionFrom: 'v1',
    versionTo: 'v2',
    skills: skillChipFixtures.slice(0, 3),
  },
};

export const FallbackChain: Story = {
  args: {
    fallbackSteps: processStepFixtures,
  },
};
