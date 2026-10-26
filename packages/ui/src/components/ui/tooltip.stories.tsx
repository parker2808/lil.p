import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hint</Button>
        </TooltipTrigger>
        <TooltipContent>Opens on focus after 500ms</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
