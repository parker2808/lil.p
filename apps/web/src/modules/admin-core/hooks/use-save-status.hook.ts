'use client';

import type { SaveStatusState } from '@portfolio/ui/components/SaveStatus/SaveStatus';
import { useFormatter, useTranslations } from 'next-intl';

import type { AutosaveStatus } from './use-autosave.hook';

export function useSaveStatus({
  status,
  savedAt,
}: {
  status: AutosaveStatus;
  savedAt: string | null;
}): { state: SaveStatusState; text?: string } {
  const t = useTranslations('admin.editor');
  const format = useFormatter();
  const text = savedAt
    ? t('savedAt', {
        time: format.dateTime(new Date(savedAt), {
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }),
      })
    : undefined;

  if (status === 'dirty') {
    return { state: savedAt ? 'saved' : 'idle', text };
  }
  return { state: status, text };
}
