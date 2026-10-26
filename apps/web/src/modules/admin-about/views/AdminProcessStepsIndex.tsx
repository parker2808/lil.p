'use client';

import { processStepCreateSchema } from '@portfolio/contracts';
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

import { processStepsApi } from '../services/process-steps.service';

export function AdminProcessStepsIndex() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('process');
  const list = useSmallEntityList('process-steps', processStepsApi);
  const create = useCreateSmallEntity('process-steps', processStepsApi);
  const update = useUpdateSmallEntity('process-steps', processStepsApi);
  const remove = useRemoveSmallEntity('process-steps', processStepsApi);
  const move = useMoveSmallEntity('process-steps', processStepsApi);
  const toggle = useToggleSmallEntityVisible('process-steps', processStepsApi);
  const columns = useMemo<
    ColumnDef<{ id: number; titleEn: string; captionEn: string; isVisible: boolean }>[]
  >(
    () => [
      { id: 'titleEn', accessorKey: 'titleEn', header: t('columns.title') },
      { id: 'captionEn', accessorKey: 'captionEn', header: t('columns.caption') },
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
        { name: 'titleEn', label: t('fields.titleEn'), kind: 'text' },
        { name: 'titleVi', label: t('fields.titleVi'), kind: 'text' },
        { name: 'captionEn', label: t('fields.captionEn'), kind: 'text' },
        { name: 'captionVi', label: t('fields.captionVi'), kind: 'text' },
        { name: 'iconKey', label: t('fields.icon'), kind: 'icon' },
        { name: 'isVisible', label: t('visible'), kind: 'switch' },
      ]}
      defaults={{
        titleEn: '',
        titleVi: '',
        captionEn: '',
        captionVi: '',
        iconKey: 'sparkles',
        isVisible: true,
      }}
      schema={processStepCreateSchema as never}
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
