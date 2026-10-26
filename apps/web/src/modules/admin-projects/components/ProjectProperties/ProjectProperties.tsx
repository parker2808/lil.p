'use client';

import type { AdminExperience, AdminSkill } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { useState } from 'react';

import { MediaField } from '@/modules/admin-media/components/MediaField/MediaField';
import { MediaPickerDialog } from '@/modules/admin-media/components/MediaPickerDialog/MediaPickerDialog';

import type { ProjectFormValues } from '../../utils/project-form.util';

export function ProjectProperties({
  values,
  skills,
  experience,
  readOnly,
  labels,
  onChange,
}: {
  values: ProjectFormValues;
  skills: AdminSkill[];
  experience: AdminExperience[];
  readOnly: boolean;
  labels: {
    status: string;
    slug: string;
    client: string;
    role: string;
    startDate: string;
    endDate: string;
    featured: string;
    confidential: string;
    experience: string;
    skills: string;
    versionFrom: string;
    versionTo: string;
    liveUrl: string;
    repoUrl: string;
    cover: string;
    gallery: string;
    captionEn: string;
    captionVi: string;
    addImage: string;
    choose: string;
    clear: string;
    emptyMedia: string;
    none: string;
    draft: string;
    published: string;
    archived: string;
  };
  onChange: <K extends keyof ProjectFormValues>(name: K, value: ProjectFormValues[K]) => void;
}) {
  const selectedSkills = new Set(values.skillIds ?? []);
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <MediaField
        label={labels.cover}
        accept="image"
        readOnly={readOnly}
        chooseLabel={labels.choose}
        clearLabel={labels.clear}
        emptyLabel={labels.emptyMedia}
        value={
          values.cover
            ? {
                id: values.cover.id,
                url: values.cover.url,
                originalName: values.cover.originalName,
                mimeType: values.cover.mimeType,
              }
            : null
        }
        onChange={(media) => {
          onChange('coverId', media?.id ?? null);
          onChange('cover', media);
        }}
      />
      <Field>
        <FieldLabel>{labels.status}</FieldLabel>
        <Select
          value={values.status ?? 'DRAFT'}
          disabled={readOnly || values.id == null}
          onValueChange={(value) =>
            onChange('status', value as NonNullable<ProjectFormValues['status']>)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">{labels.draft}</SelectItem>
            <SelectItem value="PUBLISHED">{labels.published}</SelectItem>
            <SelectItem value="ARCHIVED">{labels.archived}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="slug">{labels.slug}</FieldLabel>
        <Input
          id="slug"
          value={values.slug}
          disabled={readOnly}
          onChange={(event) => onChange('slug', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="client">{labels.client}</FieldLabel>
        <Input
          id="client"
          value={values.client}
          disabled={readOnly}
          onChange={(event) => onChange('client', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="roleEn">{labels.role}</FieldLabel>
        <Input
          id="roleEn"
          value={values.roleEn}
          disabled={readOnly}
          onChange={(event) => onChange('roleEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="startDate">{labels.startDate}</FieldLabel>
        <Input
          id="startDate"
          type="date"
          value={values.startDate.slice(0, 10)}
          disabled={readOnly}
          onChange={(event) => onChange('startDate', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="endDate">{labels.endDate}</FieldLabel>
        <Input
          id="endDate"
          type="date"
          value={values.endDate?.slice(0, 10) ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('endDate', event.target.value || null)}
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
      <Field className="flex-row items-center justify-between">
        <FieldLabel htmlFor="confidential">{labels.confidential}</FieldLabel>
        <Switch
          id="confidential"
          checked={Boolean(values.isConfidential)}
          disabled={readOnly}
          onCheckedChange={(checked) => onChange('isConfidential', checked)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.experience}</FieldLabel>
        <Select
          value={values.experienceId == null ? 'none' : String(values.experienceId)}
          disabled={readOnly}
          onValueChange={(value) =>
            onChange('experienceId', value === 'none' ? null : Number(value))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={labels.none} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{labels.none}</SelectItem>
            {experience.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>{labels.skills}</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => {
            const on = selectedSkills.has(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                disabled={readOnly}
                className="disabled:opacity-50"
                onClick={() => {
                  const next = new Set(selectedSkills);
                  if (on) {
                    next.delete(skill.id);
                  } else {
                    next.add(skill.id);
                  }
                  onChange('skillIds', [...next]);
                }}
              >
                <Badge variant={on ? 'primary' : 'outline'} className="normal-case">
                  {skill.name}
                </Badge>
              </button>
            );
          })}
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor="versionFrom">{labels.versionFrom}</FieldLabel>
        <Input
          id="versionFrom"
          value={values.versionFrom ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('versionFrom', event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="versionTo">{labels.versionTo}</FieldLabel>
        <Input
          id="versionTo"
          value={values.versionTo ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('versionTo', event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="liveUrl">{labels.liveUrl}</FieldLabel>
        <Input
          id="liveUrl"
          value={values.liveUrl ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('liveUrl', event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="repoUrl">{labels.repoUrl}</FieldLabel>
        <Input
          id="repoUrl"
          value={values.repoUrl ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('repoUrl', event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.gallery}</FieldLabel>
        <ul className="flex flex-col gap-3">
          {(values.gallery ?? []).map((image, index) => (
            <li key={`${image.mediaId}-${index}`} className="flex flex-col gap-2">
              <p className="text-ui-meta truncate">{image.media.originalName}</p>
              <Input
                value={image.captionEn ?? ''}
                disabled={readOnly}
                aria-label={labels.captionEn}
                onChange={(event) => {
                  const gallery = [...(values.gallery ?? [])];
                  const current = gallery[index];
                  if (!current) {
                    return;
                  }
                  gallery[index] = { ...current, captionEn: event.target.value };
                  onChange('gallery', gallery);
                  onChange(
                    'images',
                    gallery.map((row, sortOrder) => ({
                      mediaId: row.mediaId,
                      captionEn: row.captionEn,
                      captionVi: row.captionVi,
                      sortOrder,
                    })),
                  );
                }}
              />
              {readOnly ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const gallery = (values.gallery ?? []).filter((_, item) => item !== index);
                    onChange('gallery', gallery);
                    onChange(
                      'images',
                      gallery.map((row, sortOrder) => ({
                        mediaId: row.mediaId,
                        captionEn: row.captionEn,
                        captionVi: row.captionVi,
                        sortOrder,
                      })),
                    );
                  }}
                >
                  {labels.clear}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {readOnly ? null : (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setGalleryOpen(true)}>
              {labels.addImage}
            </Button>
            <MediaPickerDialog
              open={galleryOpen}
              accept="image"
              onOpenChange={setGalleryOpen}
              onPick={(media) => {
                const gallery = [
                  ...(values.gallery ?? []),
                  {
                    id: media.id,
                    mediaId: media.id,
                    captionEn: '',
                    captionVi: '',
                    sortOrder: (values.gallery ?? []).length,
                    media,
                  },
                ];
                onChange('gallery', gallery);
                onChange(
                  'images',
                  gallery.map((row, sortOrder) => ({
                    mediaId: row.mediaId,
                    captionEn: row.captionEn,
                    captionVi: row.captionVi,
                    sortOrder,
                  })),
                );
              }}
            />
          </>
        )}
      </Field>
    </div>
  );
}
