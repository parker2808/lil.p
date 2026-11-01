'use client';

import type { AdminSkill, EmploymentType } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
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
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import type { MarkdownEditorLabels } from '@portfolio/ui/components/MarkdownEditor/types';

import { MarkdownField } from '@/modules/admin-core/components/MarkdownField/MarkdownField';

import type { ExperienceFormValues } from '../../utils/experience-form.util';

export function ExperienceForm({
  values,
  locale,
  skills,
  errors,
  readOnly,
  labels,
  editorLabels,
  previewLabels,
  onChange,
  onBlur,
  onBaseline,
}: {
  values: ExperienceFormValues;
  locale: 'en' | 'vi';
  skills: AdminSkill[];
  errors: Record<string, string>;
  readOnly: boolean;
  labels: {
    company: string;
    companyUrl: string;
    location: string;
    employmentType: string;
    fullTime: string;
    contract: string;
    freelance: string;
    role: string;
    summary: string;
    highlights: string;
    startDate: string;
    endDate: string;
    visible: string;
    skills: string;
  };
  editorLabels: MarkdownEditorLabels;
  previewLabels: {
    copy: string;
    copied: string;
    wrap: string;
    note: string;
    warning: string;
    anchor: string;
  };
  onChange: <K extends keyof ExperienceFormValues>(name: K, value: ExperienceFormValues[K]) => void;
  onBlur: () => void;
  onBaseline: (field: string, markdown: string) => void;
}) {
  const roleKey = locale === 'en' ? 'roleEn' : 'roleVi';
  const summaryKey = locale === 'en' ? 'summaryEn' : 'summaryVi';
  const highlightsKey = locale === 'en' ? 'highlightsEn' : 'highlightsVi';
  const selectedSkills = new Set(values.skillIds ?? []);

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="company">{labels.company}</FieldLabel>
        <Input
          id="company"
          value={values.company}
          disabled={readOnly}
          aria-invalid={Boolean(errors.company)}
          onChange={(event) => onChange('company', event.target.value)}
          onBlur={onBlur}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="companyUrl">{labels.companyUrl}</FieldLabel>
        <Input
          id="companyUrl"
          value={values.companyUrl ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('companyUrl', event.target.value || null)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="location">{labels.location}</FieldLabel>
        <Input
          id="location"
          value={values.location}
          disabled={readOnly}
          onChange={(event) => onChange('location', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.employmentType}</FieldLabel>
        <Select
          value={values.employmentType}
          disabled={readOnly}
          onValueChange={(value) => onChange('employmentType', value as EmploymentType)}
        >
          <SelectTrigger aria-label={labels.employmentType}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FULL_TIME">{labels.fullTime}</SelectItem>
            <SelectItem value="CONTRACT">{labels.contract}</SelectItem>
            <SelectItem value="FREELANCE">{labels.freelance}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor={roleKey}>{labels.role}</FieldLabel>
        <Input
          id={roleKey}
          value={values[roleKey]}
          disabled={readOnly}
          onChange={(event) => onChange(roleKey, event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={summaryKey}>{labels.summary}</FieldLabel>
        <Textarea
          id={summaryKey}
          rows={3}
          value={values[summaryKey]}
          disabled={readOnly}
          onChange={(event) => onChange(summaryKey, event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.highlights}</FieldLabel>
        <MarkdownField
          ariaLabel={labels.highlights}
          value={String(values[highlightsKey] ?? '')}
          onChange={(markdown) => onChange(highlightsKey, markdown)}
          onBlur={onBlur}
          onBaseline={(markdown) => onBaseline(String(highlightsKey), markdown)}
          labels={editorLabels}
          previewLabels={previewLabels}
          readOnly={readOnly}
          variant="compact"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="startDate">{labels.startDate}</FieldLabel>
        <Input
          id="startDate"
          type="month"
          value={values.startDate.slice(0, 7)}
          disabled={readOnly}
          onChange={(event) => onChange('startDate', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="endDate">{labels.endDate}</FieldLabel>
        <Input
          id="endDate"
          type="month"
          value={values.endDate?.slice(0, 7) ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange('endDate', event.target.value || null)}
        />
      </Field>
      <Field className="flex-row items-center justify-between">
        <FieldLabel htmlFor="visible">{labels.visible}</FieldLabel>
        <Switch
          id="visible"
          checked={Boolean(values.isVisible)}
          disabled={readOnly}
          onCheckedChange={(checked) => onChange('isVisible', checked)}
        />
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
    </div>
  );
}
