import type { Meta, StoryObj } from '@storybook/react';

import { MediaUploader } from './MediaUploader';

const meta = {
  title: 'Admin/MediaUploader',
  component: MediaUploader,
  args: {
    items: [
      { id: '1', name: 'cover.jpg', progress: 45, status: 'uploading' },
      { id: '2', name: 'resume.pdf', progress: 100, status: 'done' },
    ],
    labels: {
      drop: 'Drop files here',
      browse: 'or browse',
      cancel: 'Cancel',
      uploading: 'Uploading',
      done: 'Done',
      error: 'Failed',
      cancelled: 'Cancelled',
    },
    onFiles: () => undefined,
    onCancel: () => undefined,
  },
} satisfies Meta<typeof MediaUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InFlight: Story = {};

export const Idle: Story = {
  args: { items: [] },
};
