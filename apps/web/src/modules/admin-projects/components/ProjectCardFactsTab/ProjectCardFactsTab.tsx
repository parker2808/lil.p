'use client';

import type { AdminDomain, PublicProjectListItem } from '@portfolio/contracts';
import { CaseCard } from '@portfolio/ui/components/CaseCard/CaseCard';
import { Field, FieldDescription, FieldLabel } from '@portfolio/ui/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portfolio/ui/components/ui/select';
import { Textarea } from '@portfolio/ui/components/ui/textarea';

import { countLines, type ProjectFormValues } from '../../utils/project-form.util';

export function ProjectCardFactsTab({
  values,
  locale,
  domains,
  readOnly,
  labels,
  onChange,
}: {
  values: ProjectFormValues;
  locale: 'en' | 'vi';
  domains: AdminDomain[];
  readOnly: boolean;
  labels: {
    domain: string;
    none: string;
    keyFacts: string;
    keyFactsCount: string;
    factChips: string;
    factChipsCount: string;
    preview: string;
    nda: string;
  };
  onChange: <K extends keyof ProjectFormValues>(name: K, value: ProjectFormValues[K]) => void;
}) {
  const keyFactsKey = locale === 'en' ? 'keyFactsEn' : 'keyFactsVi';
  const chipsKey = locale === 'en' ? 'factChipsEn' : 'factChipsVi';
  const keyFacts = String(values[keyFactsKey] ?? '');
  const chips = String(values[chipsKey] ?? '');
  const domain = domains.find((item) => item.id === values.domainId) ?? null;
  const preview: PublicProjectListItem = {
    id: values.id ?? 0,
    slug: values.slug || 'preview',
    title: locale === 'en' ? values.titleEn : values.titleVi || values.titleEn,
    tagline: locale === 'en' ? values.taglineEn : values.taglineVi || values.taglineEn,
    client: values.client,
    isFeatured: Boolean(values.isFeatured),
    isConfidential: Boolean(values.isConfidential),
    startDate: values.startDate,
    endDate: values.endDate ?? null,
    versionFrom: values.versionFrom ?? null,
    versionTo: values.versionTo ?? null,
    domain: domain
      ? {
          slug: domain.slug,
          name: locale === 'en' ? domain.nameEn : domain.nameVi,
          hue: domain.hue,
          iconKey: domain.iconKey,
          lang: locale,
        }
      : null,
    topMetric: values.metrics?.[0]
      ? {
          id: 0,
          label: locale === 'en' ? values.metrics[0].labelEn : values.metrics[0].labelVi,
          before: values.metrics[0].before ?? null,
          after: values.metrics[0].after ?? null,
          value: values.metrics[0].value,
          lang: locale,
        }
      : null,
    factChips: chips
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6),
    skills: [],
    lang: locale,
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Field>
          <FieldLabel>{labels.domain}</FieldLabel>
          <Select
            value={values.domainId == null ? 'none' : String(values.domainId)}
            disabled={readOnly}
            onValueChange={(value) => onChange('domainId', value === 'none' ? null : Number(value))}
          >
            <SelectTrigger aria-label={labels.domain}>
              <SelectValue placeholder={labels.none} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{labels.none}</SelectItem>
              {domains.map((item) => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={keyFactsKey}>{labels.keyFacts}</FieldLabel>
          <Textarea
            id={keyFactsKey}
            rows={4}
            value={keyFacts}
            disabled={readOnly}
            onChange={(event) => onChange(keyFactsKey, event.target.value)}
          />
          <FieldDescription>
            {labels.keyFactsCount.replace('{count}', String(countLines(keyFacts)))}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={chipsKey}>{labels.factChips}</FieldLabel>
          <Textarea
            id={chipsKey}
            rows={6}
            value={chips}
            disabled={readOnly}
            onChange={(event) => {
              const next = event.target.value.split('\n').slice(0, 6).join('\n');
              onChange(chipsKey, next);
            }}
          />
          <FieldDescription>
            {labels.factChipsCount.replace('{count}', String(countLines(chips)))}
          </FieldDescription>
        </Field>
      </div>
      <div>
        <p className="text-ui-meta text-muted-foreground mb-3">{labels.preview}</p>
        <CaseCard project={preview} href="#" labels={{ nda: labels.nda }} />
      </div>
    </div>
  );
}
