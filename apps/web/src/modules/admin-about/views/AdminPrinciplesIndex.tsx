'use client';

import { principleCreateSchema } from '@portfolio/contracts';
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

import { principlesApi } from '../services/principles.service';

export function AdminPrinciplesIndex() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('principles');
  const list = useSmallEntityList('principles', principlesApi);
  const create = useCreateSmallEntity('principles', principlesApi);
  const update = useUpdateSmallEntity('principles', principlesApi);
  const remove = useRemoveSmallEntity('principles', principlesApi);
  const move = useMoveSmallEntity('principles', principlesApi);
  const toggle = useToggleSmallEntityVisible('principles', principlesApi);
  const columns = useMemo<
    ColumnDef<{ id: number; titleEn: string; iconKey: string; isVisible: boolean }>[]
  >(
    () => [
      { id: 'titleEn', accessorKey: 'titleEn', header: t('columns.title') },
      { id: 'iconKey', accessorKey: 'iconKey', header: t('columns.icon') },
    ],
    [t],
  );

  return (
    <SmallEntityIndex
      title={t('title')}
      items={list.data ?? []}
      isError={list.isError}
      isLoading={list.isPending}
      isFetching={list.isFetching}
      canWrite={canWrite}
      fields={[
        { name: 'titleEn', label: t('fields.titleEn'), kind: 'text' },
        { name: 'titleVi', label: t('fields.titleVi'), kind: 'text' },
        { name: 'bodyEn', label: t('fields.bodyEn'), kind: 'textarea' },
        { name: 'bodyVi', label: t('fields.bodyVi'), kind: 'textarea' },
        { name: 'iconKey', label: t('fields.icon'), kind: 'icon' },
        { name: 'isVisible', label: t('visible'), kind: 'switch' },
      ]}
      defaults={{
        titleEn: '',
        titleVi: '',
        bodyEn: '',
        bodyVi: '',
        iconKey: 'sparkles',
        isVisible: true,
      }}
      schema={principleCreateSchema as never}
      columns={columns as never}
      titleOf={(row) => row.titleEn}
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
