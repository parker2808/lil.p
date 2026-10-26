'use client';

import { educationCreateSchema } from '@portfolio/contracts';
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

import { educationApi } from '../services/education.service';

export function AdminEducationIndex() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('education');
  const columns = useMemo<
    ColumnDef<{
      id: number;
      school: string;
      degreeEn: string;
      startDate: string;
      isVisible: boolean;
    }>[]
  >(
    () => [
      { id: 'school', accessorKey: 'school', header: t('columns.school') },
      { id: 'degreeEn', accessorKey: 'degreeEn', header: t('columns.degree') },
      { id: 'startDate', accessorKey: 'startDate', header: t('columns.start') },
    ],
    [t],
  );
  const list = useSmallEntityList('education', educationApi);
  const create = useCreateSmallEntity('education', educationApi);
  const update = useUpdateSmallEntity('education', educationApi);
  const remove = useRemoveSmallEntity('education', educationApi);
  const move = useMoveSmallEntity('education', educationApi);
  const toggle = useToggleSmallEntityVisible('education', educationApi);

  return (
    <SmallEntityIndex
      title={t('title')}
      items={list.data ?? []}
      isError={list.isError}
      canWrite={canWrite}
      fields={[
        { name: 'school', label: t('fields.school'), kind: 'text' },
        { name: 'degreeEn', label: t('fields.degreeEn'), kind: 'text' },
        { name: 'degreeVi', label: t('fields.degreeVi'), kind: 'text' },
        { name: 'majorEn', label: t('fields.majorEn'), kind: 'text' },
        { name: 'majorVi', label: t('fields.majorVi'), kind: 'text' },
        { name: 'startDate', label: t('fields.startDate'), kind: 'text' },
        { name: 'endDate', label: t('fields.endDate'), kind: 'text' },
        { name: 'isVisible', label: t('visible'), kind: 'switch' },
      ]}
      defaults={{
        school: '',
        degreeEn: '',
        degreeVi: '',
        majorEn: '',
        majorVi: '',
        startDate: '',
        endDate: '',
        isVisible: true,
      }}
      schema={educationCreateSchema as never}
      columns={columns as never}
      titleOf={(row) => row.school}
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
