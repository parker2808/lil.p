'use client';

import { profileStatCreateSchema } from '@portfolio/contracts';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { SmallEntityIndex } from '@/modules/admin-core/components/SmallEntityIndex/SmallEntityIndex';
import { useEntityChrome } from '@/modules/admin-core/hooks/use-entity-chrome.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import {
  useCreateSmallEntity,
  useMoveSmallEntity,
  useRemoveSmallEntity,
  useSmallEntityList,
  useToggleSmallEntityVisible,
  useUpdateSmallEntity,
} from '@/modules/admin-core/hooks/use-small-entity.hook';

import { profileStatsApi } from '../services/profile-stats.service';

export function AdminProfileStatsIndex() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('stats');
  const list = useSmallEntityList('profile-stats', profileStatsApi);
  const create = useCreateSmallEntity('profile-stats', profileStatsApi);
  const update = useUpdateSmallEntity('profile-stats', profileStatsApi);
  const remove = useRemoveSmallEntity('profile-stats', profileStatsApi);
  const move = useMoveSmallEntity('profile-stats', profileStatsApi);
  const toggle = useToggleSmallEntityVisible('profile-stats', profileStatsApi);
  const columns = useMemo<
    ColumnDef<{
      id: number;
      labelEn: string;
      value: string | null;
      source: string;
      isVisible: boolean;
    }>[]
  >(
    () => [
      { id: 'labelEn', accessorKey: 'labelEn', header: t('columns.label') },
      { id: 'value', accessorKey: 'value', header: t('columns.value') },
      { id: 'source', accessorKey: 'source', header: t('columns.source') },
    ],
    [t],
  );

  return (
    <SmallEntityIndex
      title={t('title')}
      items={list.data ?? []}
      isError={list.isError}
      canWrite={canWrite}
      fields={[
        { name: 'labelEn', label: t('fields.labelEn'), kind: 'text' },
        { name: 'labelVi', label: t('fields.labelVi'), kind: 'text' },
        { name: 'value', label: t('fields.value'), kind: 'text' },
        { name: 'suffix', label: t('fields.suffix'), kind: 'text' },
        {
          name: 'source',
          label: t('fields.source'),
          kind: 'select',
          options: [
            { value: 'MANUAL', label: t('source.MANUAL') },
            { value: 'YEARS_COMPUTED', label: t('source.YEARS_COMPUTED') },
            { value: 'PROJECT_COUNT', label: t('source.PROJECT_COUNT') },
          ],
        },
        { name: 'iconKey', label: t('fields.icon'), kind: 'icon' },
        { name: 'isVisible', label: t('visible'), kind: 'switch' },
      ]}
      defaults={{
        labelEn: '',
        labelVi: '',
        value: '',
        suffix: '',
        source: 'MANUAL',
        iconKey: 'sparkles',
        isVisible: true,
      }}
      schema={profileStatCreateSchema as never}
      columns={columns as never}
      titleOf={(row) => row.labelEn}
      hasReorder
      hasVisible
      labels={labels}
      pickerLabels={pickerLabels}
      onCreate={(body) => create.mutateAsync(body)}
      onUpdate={(id, body) => update.mutateAsync({ id, body })}
      onDelete={(id) => remove.mutate(id)}
      onMove={(id, direction) => move.mutate({ id, direction })}
      onToggleVisible={(row) => toggle.mutate(row)}
      onRetry={() => void list.refetch()}
    />
  );
}
