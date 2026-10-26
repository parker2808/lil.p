import type { Meta, StoryObj } from '@storybook/react';

import { SaveStatus } from './SaveStatus';

const labels = {
  saving: 'Saving',
  saved: 'Saved 12s ago',
  offline: 'Offline, changes kept locally',
  conflict: 'Conflict: newer version',
  loadLatest: 'Load latest',
  overwrite: 'Overwrite',
};

const meta = {
  title: 'Admin/SaveStatus',
  component: SaveStatus,
  args: { labels },
} satisfies Meta<typeof SaveStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Saving: Story = { args: { state: 'saving' } };
export const Saved: Story = { args: { state: 'saved', savedText: labels.saved } };
export const Offline: Story = { args: { state: 'offline' } };
export const Conflict: Story = { args: { state: 'conflict' } };
