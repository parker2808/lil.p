'use client';

import { tagCreateSchema } from '@portfolio/contracts';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { SmallEntityIndex } from '@/modules/admin-core/components/SmallEntityIndex/SmallEntityIndex';
import { useEntityChrome } from '@/modules/admin-core/hooks/use-entity-chrome.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import {
  useCreateSmallEntity,
  useRemoveSmallEntity,
  useSmallEntityList,
  useUpdateSmallEntity,
} from '@/modules/admin-core/hooks/use-small-entity.hook';

import { tagsApi } from '../services/tags.service';

export function AdminTagsIndex() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('tags');
  const list = useSmallEntityList('tags', tagsApi);
  const create = useCreateSmallEntity('tags', tagsApi);
  const update = useUpdateSmallEntity('tags', tagsApi);
  const remove = useRemoveSmallEntity('tags', tagsApi);
  const columns = useMemo<ColumnDef<{ id: number; slug: string; nameEn: string }>[]>(
    () => [
      { id: 'nameEn', accessorKey: 'nameEn', header: t('columns.name') },
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
        { name: 'nameEn', label: t('fields.nameEn'), kind: 'text' },
        { name: 'nameVi', label: t('fields.nameVi'), kind: 'text' },
      ]}
      defaults={{ nameEn: '', nameVi: '' }}
      schema={tagCreateSchema as never}
      columns={columns as never}
      titleOf={(row) => row.nameEn}
      hasReorder={false}
      hasVisible={false}
      labels={labels}
      pickerLabels={pickerLabels}
      onCreate={(body) => create.mutateAsync(body)}
      onUpdate={(id, body) => update.mutateAsync({ id, body })}
      onDelete={(id) => remove.mutate(id)}
      onRetry={() => void list.refetch()}
    />
  );
}
