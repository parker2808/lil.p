import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MediaUploader } from './MediaUploader';

const labels = {
  drop: 'Drop files here',
  browse: 'or browse',
  cancel: 'Cancel',
  uploading: 'Uploading',
  done: 'Done',
  error: 'Failed',
  cancelled: 'Cancelled',
};

describe('MediaUploader', () => {
  it('shows progress and cancels an in-flight file', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MediaUploader
        items={[
          { id: 'a', name: 'cover.jpg', progress: 40, status: 'uploading' },
          { id: 'b', name: 'done.jpg', progress: 100, status: 'done' },
        ]}
        labels={labels}
        onFiles={vi.fn()}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('progressbar', { name: /cover.jpg/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledWith('a');
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
