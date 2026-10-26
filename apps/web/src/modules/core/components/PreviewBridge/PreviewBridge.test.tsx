import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

import { PreviewBridge } from './PreviewBridge';

describe('PreviewBridge', () => {
  afterEach(() => {
    cleanup();
    refresh.mockReset();
  });

  it('ignores messages from another origin', () => {
    render(<PreviewBridge />);
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://evil.test',
        data: { type: 'preview:refresh' },
      }),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes on a same-origin preview:refresh message', () => {
    render(<PreviewBridge />);
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: 'preview:refresh' },
      }),
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
