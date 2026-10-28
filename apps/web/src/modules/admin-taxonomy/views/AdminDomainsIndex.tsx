'use client';

import { domainCreateSchema } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { BADGE_HUE } from '@portfolio/ui/utils/hue.util';
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

import { domainsApi } from '../services/domains.service';

export function AdminDomainsIndex() {
  const canWrite = useIsAdmin();
  const { t, labels, pickerLabels } = useEntityChrome('domains');
  const list = useSmallEntityList('domains', domainsApi);
  const create = useCreateSmallEntity('domains', domainsApi);
  const update = useUpdateSmallEntity('domains', domainsApi);
  const remove = useRemoveSmallEntity('domains', domainsApi);
  const move = useMoveSmallEntity('domains', domainsApi);
  const toggle = useToggleSmallEntityVisible('domains', domainsApi);
  const columns = useMemo<
    ColumnDef<{
      id: number;
      nameEn: string;
      slug: string;
      hue: 'JADE' | 'AMBER' | 'BLUE' | 'VIOLET' | 'ROSE';
      iconKey: string;
      isVisible: boolean;
    }>[]
  >(
    () => [
      { id: 'nameEn', accessorKey: 'nameEn', header: t('columns.name') },
      { id: 'slug', accessorKey: 'slug', header: t('columns.slug') },
      {
        id: 'hue',
        header: t('columns.hue'),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge hue={BADGE_HUE[row.original.hue]} className="normal-case">
            {row.original.hue}
          </Badge>
        ),
      },
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
        { name: 'slug', label: t('fields.slug'), kind: 'text' },
        { name: 'nameEn', label: t('fields.nameEn'), kind: 'text' },
        { name: 'nameVi', label: t('fields.nameVi'), kind: 'text' },
        { name: 'descriptionEn', label: t('fields.descriptionEn'), kind: 'textarea' },
        { name: 'descriptionVi', label: t('fields.descriptionVi'), kind: 'textarea' },
        { name: 'hue', label: t('fields.hue'), kind: 'hue' },
        { name: 'iconKey', label: t('fields.icon'), kind: 'icon' },
        { name: 'isVisible', label: t('visible'), kind: 'switch' },
      ]}
      defaults={{
        slug: '',
        nameEn: '',
        nameVi: '',
        descriptionEn: '',
        descriptionVi: '',
        hue: 'JADE',
        iconKey: 'sparkles',
        isVisible: true,
      }}
      schema={domainCreateSchema as never}
      columns={columns as never}
      titleOf={(row) => row.nameEn}
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
