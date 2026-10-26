import { processStepFixtures } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { ProcessFlow } from './ProcessFlow';

const meta = {
  title: 'Sections/ProcessFlow',
  component: ProcessFlow,
} satisfies Meta<typeof ProcessFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { steps: processStepFixtures },
};
