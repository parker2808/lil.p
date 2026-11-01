import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const toasterProps = vi.fn();
vi.mock('sonner', () => ({
  Toaster: (props: Record<string, unknown>) => {
    toasterProps(props);
    return null;
  },
}));
vi.mock('./Providers', () => ({ Providers: ({ children }: { children: ReactNode }) => children }));
vi.mock('./QueryProvider', () => ({
  QueryProvider: ({ children }: { children: ReactNode }) => children,
}));

import { AdminProviders } from './AdminProviders';

describe('AdminProviders', () => {
  it('shows toasts bottom-right for four seconds', () => {
    render(<AdminProviders messages={{}}>content</AdminProviders>);
    expect(toasterProps).toHaveBeenCalledWith({ position: 'bottom-right', duration: 4000 });
  });
});
