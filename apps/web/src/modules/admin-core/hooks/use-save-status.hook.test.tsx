import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import en from '../../../../i18n/locales/en.json';

import type { AutosaveStatus } from './use-autosave.hook';
import { useSaveStatus } from './use-save-status.hook';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

function render(status: AutosaveStatus, savedAt: string | null) {
  return renderHook(() => useSaveStatus({ status, savedAt }), { wrapper }).result.current;
}

const SAVED_AT = '2026-01-01T10:42:00.000Z';

describe('useSaveStatus', () => {
  it('shows the saved time on load', () => {
    expect(render('saved', SAVED_AT)).toEqual({ state: 'saved', text: 'Saved 10:42' });
  });

  it('keeps the last saved time visible while changes are pending', () => {
    expect(render('dirty', SAVED_AT)).toEqual({ state: 'saved', text: 'Saved 10:42' });
  });

  it('hides the status for a record that was never saved', () => {
    expect(render('dirty', null)).toEqual({ state: 'idle', text: undefined });
    expect(render('idle', null)).toEqual({ state: 'idle', text: undefined });
  });

  it('passes saving and error states through', () => {
    expect(render('saving', SAVED_AT).state).toBe('saving');
    expect(render('offline', SAVED_AT).state).toBe('offline');
    expect(render('conflict', SAVED_AT).state).toBe('conflict');
  });
});
