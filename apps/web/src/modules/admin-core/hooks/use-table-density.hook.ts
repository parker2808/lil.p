'use client';

import type { AdminTableDensity } from '@portfolio/ui/components/AdminTable/AdminTable';
import { useCallback, useSyncExternalStore } from 'react';

export const TABLE_DENSITY_STORAGE_KEY = 'admin.table.density';

const listeners = new Set<() => void>();
/** Used when storage is blocked (private mode), so the toggle still works until reload. */
let memoryDensity: AdminTableDensity = 'comfortable';

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function readDensity(): AdminTableDensity {
  try {
    return window.localStorage.getItem(TABLE_DENSITY_STORAGE_KEY) === 'compact'
      ? 'compact'
      : 'comfortable';
  } catch {
    return memoryDensity;
  }
}

function serverDensity(): AdminTableDensity {
  return 'comfortable';
}

export function useTableDensity(): [AdminTableDensity, (density: AdminTableDensity) => void] {
  const density = useSyncExternalStore(subscribe, readDensity, serverDensity);
  const setDensity = useCallback((next: AdminTableDensity) => {
    memoryDensity = next;
    try {
      window.localStorage.setItem(TABLE_DENSITY_STORAGE_KEY, next);
    } catch {
      // Falls back to memoryDensity.
    }
    for (const listener of listeners) listener();
  }, []);
  return [density, setDensity];
}
