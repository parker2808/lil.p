'use client';

import { skillCategoryCreateSchema, skillCreateSchema } from '@portfolio/contracts';
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

import { skillCategoriesApi, skillsApi } from '../services/skills.service';

export function AdminSkillsIndex() {
  const canWrite = useIsAdmin();
  const skillsChrome = useEntityChrome('skills');
  const categoriesChrome = useEntityChrome('categories');
  const skills = useSmallEntityList('skills', skillsApi);
  const categories = useSmallEntityList('skill-categories', skillCategoriesApi);
  const createSkill = useCreateSmallEntity('skills', skillsApi);
  const updateSkill = useUpdateSmallEntity('skills', skillsApi);
  const removeSkill = useRemoveSmallEntity('skills', skillsApi);
  const moveSkill = useMoveSmallEntity('skills', skillsApi);
  const toggleSkill = useToggleSmallEntityVisible('skills', skillsApi);
  const createCategory = useCreateSmallEntity('skill-categories', skillCategoriesApi);
  const updateCategory = useUpdateSmallEntity('skill-categories', skillCategoriesApi);
  const removeCategory = useRemoveSmallEntity('skill-categories', skillCategoriesApi);
  const moveCategory = useMoveSmallEntity('skill-categories', skillCategoriesApi);

  const skillColumns = useMemo<
    ColumnDef<{
      id: number;
      name: string;
      depth: string;
      showInMarquee: boolean;
      isVisible: boolean;
    }>[]
  >(
    () => [
      { id: 'name', accessorKey: 'name', header: skillsChrome.t('columns.name') },
      { id: 'depth', accessorKey: 'depth', header: skillsChrome.t('columns.depth') },
      {
        id: 'showInMarquee',
        header: skillsChrome.t('columns.marquee'),
        cell: ({ row }) =>
          row.original.showInMarquee ? skillsChrome.t('marqueeOn') : skillsChrome.t('marqueeOff'),
      },
    ],
    [skillsChrome],
  );
  const categoryColumns = useMemo<ColumnDef<{ id: number; nameEn: string; skillCount: number }>[]>(
    () => [
      { id: 'nameEn', accessorKey: 'nameEn', header: categoriesChrome.t('columns.name') },
      { id: 'skillCount', accessorKey: 'skillCount', header: categoriesChrome.t('columns.count') },
    ],
    [categoriesChrome],
  );

  return (
    <div className="flex flex-col gap-10">
      <SmallEntityIndex
        title={categoriesChrome.t('title')}
        items={categories.data ?? []}
        isError={categories.isError}
        canWrite={canWrite}
        fields={[
          { name: 'nameEn', label: categoriesChrome.t('fields.nameEn'), kind: 'text' },
          { name: 'nameVi', label: categoriesChrome.t('fields.nameVi'), kind: 'text' },
        ]}
        defaults={{ nameEn: '', nameVi: '' }}
        schema={skillCategoryCreateSchema as never}
        columns={categoryColumns as never}
        titleOf={(row) => row.nameEn}
        hasReorder
        hasVisible={false}
        labels={categoriesChrome.labels}
        pickerLabels={categoriesChrome.pickerLabels}
        onCreate={(body) => createCategory.mutateAsync(body)}
        onUpdate={(id, body) => updateCategory.mutateAsync({ id, body })}
        onDelete={(id) => removeCategory.mutate(id)}
        onMove={(id, direction) => moveCategory.mutate({ id, direction })}
        onRetry={() => void categories.refetch()}
      />
      <SmallEntityIndex
        title={skillsChrome.t('title')}
        items={skills.data ?? []}
        isError={skills.isError}
        canWrite={canWrite}
        fields={[
          { name: 'name', label: skillsChrome.t('fields.name'), kind: 'text' },
          { name: 'slug', label: skillsChrome.t('fields.slug'), kind: 'text' },
          {
            name: 'categoryId',
            label: skillsChrome.t('fields.category'),
            kind: 'select',
            numeric: true,
            options: (categories.data ?? []).map((category) => ({
              value: String(category.id),
              label: category.nameEn,
            })),
          },
          {
            name: 'depth',
            label: skillsChrome.t('fields.depth'),
            kind: 'select',
            options: [
              { value: 'DAILY', label: skillsChrome.t('depth.DAILY') },
              { value: 'SHIPPED', label: skillsChrome.t('depth.SHIPPED') },
              { value: 'GROWING', label: skillsChrome.t('depth.GROWING') },
            ],
          },
          { name: 'showInMarquee', label: skillsChrome.t('fields.marquee'), kind: 'switch' },
          { name: 'isVisible', label: skillsChrome.t('visible'), kind: 'switch' },
        ]}
        defaults={{
          name: '',
          slug: '',
          categoryId: categories.data?.[0]?.id ?? 0,
          depth: 'DAILY',
          showInMarquee: false,
          isVisible: true,
        }}
        schema={skillCreateSchema as never}
        columns={skillColumns as never}
        titleOf={(row) => row.name}
        hasReorder
        hasVisible
        labels={skillsChrome.labels}
        pickerLabels={skillsChrome.pickerLabels}
        onCreate={(body) =>
          createSkill.mutateAsync({ ...body, slug: body.slug ? body.slug : undefined })
        }
        onUpdate={(id, body) => updateSkill.mutateAsync({ id, body })}
        onDelete={(id) => removeSkill.mutate(id)}
        onMove={(id, direction) => moveSkill.mutate({ id, direction })}
        onToggleVisible={(row) => toggleSkill.mutate(row)}
        onRetry={() => void skills.refetch()}
      />
    </div>
  );
}
