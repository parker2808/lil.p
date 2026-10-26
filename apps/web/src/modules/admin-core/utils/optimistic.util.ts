import type { QueryClient, QueryKey } from '@tanstack/react-query';

export type QuerySnapshot<T> = Array<[QueryKey, T | undefined]>;

export function snapshotQueries<T>(client: QueryClient, queryKey: QueryKey): QuerySnapshot<T> {
  return client.getQueriesData<T>({ queryKey });
}

export function restoreQueries<T>(client: QueryClient, snapshots: QuerySnapshot<T>): void {
  for (const [queryKey, data] of snapshots) {
    client.setQueryData(queryKey, data);
  }
}
