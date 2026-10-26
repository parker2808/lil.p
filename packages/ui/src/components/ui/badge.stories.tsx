import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from './badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = [
  'neutral',
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
  'outline',
] as const;
const HUES = ['jade', 'amber', 'blue', 'violet', 'rose'] as const;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {HUES.map((hue) => (
          <Badge key={hue} hue={hue}>
            {hue}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {HUES.map((hue) => (
          <Badge key={`${hue}-outline`} hue={hue} appearance="outline">
            {hue}
          </Badge>
        ))}
      </div>
    </div>
  ),
};
