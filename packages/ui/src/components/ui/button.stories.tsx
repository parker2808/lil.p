import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const SIZES = ['sm', 'default', 'lg'] as const;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={`${size}-${variant}`} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
          <Button size={size} loading>
            Save
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { children: 'Saving', loading: true },
};
