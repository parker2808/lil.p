import type { Me } from '@portfolio/contracts';
import { qk } from '@portfolio/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { MeProvider } from './use-me.hook';

const refreshOnce = vi.fn();
const toast = vi.fn();
const push = vi.fn();

vi.mock('@/modules/core/services/api-client.service', () => ({
  refreshOnce: () => refreshOnce(),
}));

vi.mock('sonner', () => ({
  toast: (message: string, opts: unknown) => toast(message, opts),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

import { useAdminEvents } from './use-admin-events.hook';

const admin: Me = { id: 1, email: '<email>', name: 'Parker', role: 'admin' };

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  listeners: Record<string, (event: { data: string }) => void> = {};
  onerror: (() => void) | null = null;

  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, fn: (event: { data: string }) => void) {
    this.listeners[type] = fn;
  }

  close() {}

  emit(type: string, data: unknown) {
    this.listeners[type]?.({ data: JSON.stringify(data) });
  }
}

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="en" messages={en}>
        <QueryClientProvider client={client}>
          <MeProvider me={admin}>{children}</MeProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>
    );
  };
}

describe('useAdminEvents', () => {
  afterEach(() => {
    FakeEventSource.instances = [];
    toast.mockReset();
    refreshOnce.mockReset();
  });

  it('increments unread and toasts on contact.created', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(qk.admin.inbox.unread, { unread: 1 });

    renderHook(() => useAdminEvents(), { wrapper: wrapper(client) });

    await waitFor(() => {
      expect(FakeEventSource.instances[0]?.url).toBe('/api/admin/events');
    });

    FakeEventSource.instances[0]?.emit('contact.created', { id: 9, name: 'Ana' });

    await waitFor(() => {
      expect(client.getQueryData(qk.admin.inbox.unread)).toEqual({ unread: 2 });
    });
    expect(toast).toHaveBeenCalledWith(
      'New message from Ana',
      expect.objectContaining({ action: expect.objectContaining({ label: 'Open' }) }),
    );
  });
});
