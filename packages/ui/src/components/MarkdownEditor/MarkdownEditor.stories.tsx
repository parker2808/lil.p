import { markdownKitchenSink } from '@portfolio/contracts';
import type { Meta, StoryObj } from '@storybook/react';

import { editorLabels } from './editor-labels.fixture';
import { MarkdownEditor } from './MarkdownEditor';

const meta = {
  title: 'Admin/MarkdownEditor',
  component: MarkdownEditor,
  args: {
    labels: editorLabels,
    onChange: () => undefined,
  },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: '' },
};

export const KitchenSink: Story = {
  args: { value: markdownKitchenSink },
};

export const ReadOnly: Story = {
  args: { value: markdownKitchenSink, editable: false },
};

export const Compact: Story = {
  args: { value: markdownKitchenSink, variant: 'compact' },
};
