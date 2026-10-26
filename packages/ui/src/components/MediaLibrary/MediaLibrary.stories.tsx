import type { Meta, StoryObj } from '@storybook/react';

import { MediaLibrary, type MediaLibraryItem } from './MediaLibrary';

const items: MediaLibraryItem[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  url: `https://media.test/${index + 1}`,
  alt: index % 4 === 0 ? '' : `Photo ${index + 1}`,
  originalName: `photo-${index + 1}.jpg`,
  mimeType: 'image/jpeg',
  missingAlt: index % 4 === 0,
}));

const meta = {
  title: 'Admin/MediaLibrary',
  component: MediaLibrary,
  args: {
    items,
    labels: { missingAlt: 'Missing alt', empty: 'No files', pdf: 'PDF' },
  },
} satisfies Meta<typeof MediaLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {};

export const Empty: Story = {
  args: { items: [] },
};
