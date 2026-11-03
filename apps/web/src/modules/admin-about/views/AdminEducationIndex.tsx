'use client';

import { type AdminEducation, educationCreateSchema } from '@portfolio/contracts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import { useLocale } from 'next-intl';
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

function dateRange(row: AdminEducation): string {
  return `${row.startDate.slice(0, 4)}–${row.endDate.slice(0, 4)}`;
}

export function AdminEducationIndex() {
  const canWrite = useIsAdmin();
  const locale = useLocale();
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
      isLoading={list.isPending}
      isFetching={list.isFetching}
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
      renderCard={(row: AdminEducation, index, actions) => (
        <div className="bg-card border-border grid min-w-0 grid-cols-[44px_22px_minmax(0,1fr)_44px] grid-rows-[auto_auto] items-start gap-x-1.5 gap-y-2 rounded-xl border p-3">
          <button
            type="button"
            className="text-muted-foreground flex size-11 items-center justify-center rounded-[10px] disabled:opacity-40"
            aria-label={`${labels.previous}: ${row.school}`}
            onClick={() => actions.move(-1)}
            disabled={!canWrite || index === 0}
          >
            <GripVertical size={17} aria-hidden />
          </button>
          <span className="text-primary flex min-h-11 items-center font-mono text-xs tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5 py-1">
            <strong className="text-ui line-clamp-2 leading-snug">{row.school}</strong>
            <span className="text-ui-meta text-muted-foreground line-clamp-2 leading-snug">
              {locale === 'vi' ? row.degreeVi || row.degreeEn : row.degreeEn}
              {' · '}
              {locale === 'vi' ? row.majorVi || row.majorEn : row.majorEn}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground flex size-11 items-center justify-center rounded-[10px]"
                aria-label={`${labels.shortcuts.edit}: ${row.school}`}
              >
                <MoreHorizontal size={18} aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={actions.edit}>{labels.shortcuts.edit}</DropdownMenuItem>
              {canWrite ? (
                <>
                  <DropdownMenuItem onSelect={() => actions.move(-1)} disabled={index === 0}>
                    {labels.previous}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => actions.move(1)}
                    disabled={index === list.data!.length - 1}
                  >
                    {labels.next}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={actions.toggleVisible}>
                    {labels.visible}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={actions.delete}>
                    {labels.bulkDelete}
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="bg-muted text-muted-foreground col-start-3 row-start-2 w-fit max-w-full truncate rounded-full px-2.5 py-1 font-mono text-xs whitespace-nowrap">
            {dateRange(row)}
          </span>
        </div>
      )}
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
