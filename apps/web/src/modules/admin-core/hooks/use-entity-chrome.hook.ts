'use client';

import type { Hue } from '@portfolio/contracts';
import { useTranslations } from 'next-intl';

import { adminTableLabels } from '../utils/table-labels.util';

const HUES = ['JADE', 'AMBER', 'BLUE', 'VIOLET', 'ROSE'] as const satisfies readonly Hue[];

export function useEntityChrome(section: string) {
  const t = useTranslations(`admin.${section}`);
  const table = useTranslations('admin.table');
  const pickers = useTranslations('admin.pickers');

  return {
    t,
    labels: {
      ...adminTableLabels(table, {
        empty: t('empty'),
        emptyAction: t('new'),
        noResults: t('noResults'),
        clearFilters: t('clearFilters'),
        error: t('error'),
        selected: t('selected'),
        range: t('range'),
        confirmDeleteTitle: t('confirmDeleteTitle'),
        confirmDelete: t('confirmDelete'),
        bulkDelete: t('delete'),
      }),
      new: t('new'),
      save: t('save'),
      editTitle: t('editTitle'),
      createTitle: t('createTitle'),
      search: t('search'),
      visible: t('visible'),
    },
    pickerLabels: {
      icon: {
        open: pickers('icon.open'),
        search: pickers('icon.search'),
        empty: pickers('icon.empty'),
      },
      hues: Object.fromEntries(HUES.map((hue) => [hue, pickers(`hue.${hue}`)])) as Record<
        Hue,
        string
      >,
    },
  };
}
