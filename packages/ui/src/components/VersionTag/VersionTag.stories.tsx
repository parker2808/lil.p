import type { Meta, StoryObj } from '@storybook/react';

import { VersionTag } from './VersionTag';

const meta = {
  title: 'Primitives/VersionTag',
  component: VersionTag,
} satisfies Meta<typeof VersionTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { from: 'v1', to: 'v2', arrowLabel: 'to' },
};
