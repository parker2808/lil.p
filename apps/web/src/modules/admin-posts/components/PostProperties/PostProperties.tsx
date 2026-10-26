'use client';

import type { AdminTag } from '@portfolio/contracts';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import { Switch } from '@portfolio/ui/components/ui/switch';

import type { PostFormValues } from '../../utils/post-form.util';
import { TagPicker } from '../TagPicker/TagPicker';

export function PostProperties({
  values,
  tags,
  readOnly,
  labels,
  onChange,
  onCreateTag,
}: {
  values: PostFormValues;
  tags: AdminTag[];
  readOnly: boolean;
  labels: {
    slug: string;
    featured: string;
    tags: string;
    openTags: string;
    searchTags: string;
    emptyTags: string;
    createTag: string;
    selectedTag: string;
  };
  onChange: <K extends keyof PostFormValues>(name: K, value: PostFormValues[K]) => void;
  onCreateTag: (name: string) => Promise<AdminTag | null>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="slug">{labels.slug}</FieldLabel>
        <Input
          id="slug"
          value={values.slug}
          disabled={readOnly}
          onChange={(event) => onChange('slug', event.target.value)}
        />
      </Field>
      <Field className="flex-row items-center justify-between">
        <FieldLabel htmlFor="featured">{labels.featured}</FieldLabel>
        <Switch
          id="featured"
          checked={Boolean(values.isFeatured)}
          disabled={readOnly}
          onCheckedChange={(checked) => onChange('isFeatured', checked)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.tags}</FieldLabel>
        <TagPicker
          tags={tags}
          selectedIds={values.tagIds ?? []}
          readOnly={readOnly}
          labels={{
            open: labels.openTags,
            search: labels.searchTags,
            empty: labels.emptyTags,
            create: labels.createTag,
            selected: labels.selectedTag,
          }}
          onChange={(tagIds) => onChange('tagIds', tagIds)}
          onCreate={onCreateTag}
        />
      </Field>
    </div>
  );
}
