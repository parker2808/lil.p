'use client';

import { contactTopicCreateSchema } from '@portfolio/contracts';
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

import { contactTopicsApi } from '../../services/contact-topics.service';

export function TopicsTable() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('topics');
  const list = useSmallEntityList('contact-topics', contactTopicsApi);
  const create = useCreateSmallEntity('contact-topics', contactTopicsApi);
  const update = useUpdateSmallEntity('contact-topics', contactTopicsApi);
  const remove = useRemoveSmallEntity('contact-topics', contactTopicsApi);
  const move = useMoveSmallEntity('contact-topics', contactTopicsApi);
  const toggle = useToggleSmallEntityVisible('contact-topics', contactTopicsApi);
  const columns = useMemo<ColumnDef<{ id: number; slug: string; labelEn: string }>[]>(
    () => [
      { id: 'labelEn', accessorKey: 'labelEn', header: t('columns.label') },
      { id: 'slug', accessorKey: 'slug', header: t('columns.slug') },
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
        { name: 'slug', label: t('fields.slug'), kind: 'text' },
        { name: 'labelEn', label: t('fields.labelEn'), kind: 'text' },
        { name: 'labelVi', label: t('fields.labelVi'), kind: 'text' },
        { name: 'isVisible', label: t('visible'), kind: 'switch' },
      ]}
      defaults={{ slug: '', labelEn: '', labelVi: '', isVisible: true }}
      schema={contactTopicCreateSchema as never}
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
