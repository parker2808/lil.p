'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/modules/core/utils/api-error.util';

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'offline' | 'conflict';

const FIELD_DEBOUNCE_MS = 1500;

export function useAutosave({
  value,
  baseline,
  updatedAt,
  enabled,
  storageKey,
  save,
}: {
  value: string;
  baseline: string | null;
  updatedAt: string | null;
  enabled: boolean;
  storageKey: string;
  save: (input: { value: string; updatedAt: string | null }) => Promise<{ updatedAt: string }>;
}) {
  const [saveState, setSaveState] = useState<Exclude<AutosaveStatus, 'idle' | 'dirty'>>('saved');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState(updatedAt);
  const latest = useRef({ value, baseline, currentUpdatedAt, enabled, storageKey, save });

  useEffect(() => {
    latest.current = { value, baseline, currentUpdatedAt, enabled, storageKey, save };
  }, [baseline, currentUpdatedAt, enabled, save, storageKey, value]);

  const persistOffline = useCallback(
    (markdown: string) => {
      try {
        window.localStorage.setItem(storageKey, markdown);
      } catch {
        // quota / private mode
      }
    },
    [storageKey],
  );

  const flush = useCallback(
    async (overwrite = false) => {
      const state = latest.current;
      if (!state.enabled || state.baseline === null || state.value === state.baseline) {
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        persistOffline(state.value);
        setSaveState('offline');
        return;
      }
      setSaveState('saving');
      try {
        const result = await state.save({
          value: state.value,
          updatedAt: overwrite ? null : state.currentUpdatedAt,
        });
        setCurrentUpdatedAt(result.updatedAt);
        setSavedAt(Date.now());
        setSaveState('saved');
        window.localStorage.removeItem(state.storageKey);
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          setSaveState('conflict');
          return;
        }
        persistOffline(state.value);
        setSaveState('offline');
      }
    },
    [persistOffline],
  );

  const isDirty = enabled && baseline !== null && value !== baseline;
  const status: AutosaveStatus = !enabled
    ? 'idle'
    : saveState === 'saving' || saveState === 'conflict' || saveState === 'offline'
      ? saveState
      : isDirty
        ? 'dirty'
        : saveState === 'saved' && savedAt
          ? 'saved'
          : 'idle';

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const timer = window.setTimeout(() => {
      void flush();
    }, FIELD_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [flush, isDirty, value]);

  useEffect(() => {
    function onOffline() {
      if (latest.current.value !== latest.current.baseline) {
        persistOffline(latest.current.value);
        setSaveState('offline');
      }
    }
    function onOnline() {
      void flush();
    }
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [flush, persistOffline]);

  return {
    status,
    savedAt,
    updatedAt: currentUpdatedAt,
    flush,
    overwrite: () => flush(true),
    restoreOffline: () => window.localStorage.getItem(storageKey),
  };
}
