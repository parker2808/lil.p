import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { restoreQueries, snapshotQueries } from './optimistic.util';

describe('optimistic.util', () => {
  it('restores a snapped query after a failed write', () => {
    const client = new QueryClient();
    const key = ['admin', 'projects', 'list', { page: 1 }];
    client.setQueryData(key, { items: [{ id: 1 }], total: 1 });

    const snapshots = snapshotQueries<{ items: { id: number }[]; total: number }>(client, [
      'admin',
      'projects',
    ]);
    client.setQueryData(key, { items: [], total: 0 });
    restoreQueries(client, snapshots);

    expect(client.getQueryData(key)).toEqual({ items: [{ id: 1 }], total: 1 });
  });
});
