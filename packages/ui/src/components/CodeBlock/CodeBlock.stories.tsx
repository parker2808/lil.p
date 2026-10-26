import type { Meta, StoryObj } from '@storybook/react';

import { CodeBlock } from './CodeBlock';

const meta = {
  title: 'Content/CodeBlock',
  component: CodeBlock,
  args: {
    code: 'export const answer = 42;',
    language: 'ts',
    filename: 'answer.ts',
    labels: { copy: 'Copy', copied: 'Copied', wrap: 'Wrap' },
    children: <code>export const answer = 42;</code>,
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
