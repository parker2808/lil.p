import type { Meta, StoryObj } from '@storybook/react';

import { Eyebrow } from './Eyebrow';

const meta = {
  title: 'Primitives/Eyebrow',
  component: Eyebrow,
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Eyebrow tone="primary">Case study</Eyebrow>
      <Eyebrow tone="subtle">Outcome</Eyebrow>
    </div>
  ),
};
