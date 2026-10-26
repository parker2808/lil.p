'use client';

import type { AdminSiteSettings, Availability } from '@portfolio/contracts';
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
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { useState } from 'react';

export function SettingsForm({
  initial,
  readOnly,
  labels,
  onSave,
}: {
  initial: AdminSiteSettings;
  readOnly: boolean;
  labels: {
    siteName: string;
    domain: string;
    seoTitleEn: string;
    seoTitleVi: string;
    seoDescriptionEn: string;
    seoDescriptionVi: string;
    footerNoteEn: string;
    footerNoteVi: string;
    contactIntroEn: string;
    contactIntroVi: string;
    replyTimeEn: string;
    replyTimeVi: string;
    contactEmail: string;
    availability: string;
    open: string;
    notLooking: string;
    freelance: string;
    availabilityNoteEn: string;
    availabilityNoteVi: string;
    analytics: string;
    ambient: string;
    marquee: string;
    save: string;
  };
  onSave: (values: AdminSiteSettings) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);

  function patch<K extends keyof AdminSiteSettings>(name: K, value: AdminSiteSettings[K]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      className="flex max-w-xl flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!readOnly) {
          void onSave(form);
        }
      }}
    >
      <Field>
        <FieldLabel htmlFor="siteName">{labels.siteName}</FieldLabel>
        <Input
          id="siteName"
          value={form.siteName}
          disabled={readOnly}
          onChange={(event) => patch('siteName', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="domain">{labels.domain}</FieldLabel>
        <Input
          id="domain"
          value={form.domain}
          disabled={readOnly}
          onChange={(event) => patch('domain', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seoTitleEn">{labels.seoTitleEn}</FieldLabel>
        <Input
          id="seoTitleEn"
          value={form.seoTitleEn}
          disabled={readOnly}
          onChange={(event) => patch('seoTitleEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seoTitleVi">{labels.seoTitleVi}</FieldLabel>
        <Input
          id="seoTitleVi"
          value={form.seoTitleVi}
          disabled={readOnly}
          onChange={(event) => patch('seoTitleVi', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seoDescriptionEn">{labels.seoDescriptionEn}</FieldLabel>
        <Textarea
          id="seoDescriptionEn"
          value={form.seoDescriptionEn}
          disabled={readOnly}
          onChange={(event) => patch('seoDescriptionEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seoDescriptionVi">{labels.seoDescriptionVi}</FieldLabel>
        <Textarea
          id="seoDescriptionVi"
          value={form.seoDescriptionVi}
          disabled={readOnly}
          onChange={(event) => patch('seoDescriptionVi', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="footerNoteEn">{labels.footerNoteEn}</FieldLabel>
        <Textarea
          id="footerNoteEn"
          value={form.footerNoteEn}
          disabled={readOnly}
          onChange={(event) => patch('footerNoteEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="footerNoteVi">{labels.footerNoteVi}</FieldLabel>
        <Textarea
          id="footerNoteVi"
          value={form.footerNoteVi}
          disabled={readOnly}
          onChange={(event) => patch('footerNoteVi', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="contactIntroEn">{labels.contactIntroEn}</FieldLabel>
        <Textarea
          id="contactIntroEn"
          value={form.contactIntroEn}
          disabled={readOnly}
          onChange={(event) => patch('contactIntroEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="contactIntroVi">{labels.contactIntroVi}</FieldLabel>
        <Textarea
          id="contactIntroVi"
          value={form.contactIntroVi}
          disabled={readOnly}
          onChange={(event) => patch('contactIntroVi', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="replyTimeNoteEn">{labels.replyTimeEn}</FieldLabel>
        <Input
          id="replyTimeNoteEn"
          value={form.replyTimeNoteEn}
          disabled={readOnly}
          onChange={(event) => patch('replyTimeNoteEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="replyTimeNoteVi">{labels.replyTimeVi}</FieldLabel>
        <Input
          id="replyTimeNoteVi"
          value={form.replyTimeNoteVi}
          disabled={readOnly}
          onChange={(event) => patch('replyTimeNoteVi', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="contactEmail">{labels.contactEmail}</FieldLabel>
        <Input
          id="contactEmail"
          value={form.contactEmail}
          disabled={readOnly}
          onChange={(event) => patch('contactEmail', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>{labels.availability}</FieldLabel>
        <Select
          value={form.availability}
          disabled={readOnly}
          onValueChange={(value) => patch('availability', value as Availability)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">{labels.open}</SelectItem>
            <SelectItem value="NOT_LOOKING">{labels.notLooking}</SelectItem>
            <SelectItem value="FREELANCE">{labels.freelance}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="availabilityNoteEn">{labels.availabilityNoteEn}</FieldLabel>
        <Input
          id="availabilityNoteEn"
          value={form.availabilityNoteEn}
          disabled={readOnly}
          onChange={(event) => patch('availabilityNoteEn', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="availabilityNoteVi">{labels.availabilityNoteVi}</FieldLabel>
        <Input
          id="availabilityNoteVi"
          value={form.availabilityNoteVi}
          disabled={readOnly}
          onChange={(event) => patch('availabilityNoteVi', event.target.value)}
        />
      </Field>
      <Field className="flex-row items-center justify-between">
        <FieldLabel htmlFor="analytics">{labels.analytics}</FieldLabel>
        <Switch
          id="analytics"
          checked={form.analyticsEnabled}
          disabled={readOnly}
          onCheckedChange={(checked) => patch('analyticsEnabled', checked)}
        />
      </Field>
      <Field className="flex-row items-center justify-between">
        <FieldLabel htmlFor="ambient">{labels.ambient}</FieldLabel>
        <Switch
          id="ambient"
          checked={form.ambientEffects}
          disabled={readOnly}
          onCheckedChange={(checked) => patch('ambientEffects', checked)}
        />
      </Field>
      <Field className="flex-row items-center justify-between">
        <FieldLabel htmlFor="marquee">{labels.marquee}</FieldLabel>
        <Switch
          id="marquee"
          checked={form.marqueeEnabled}
          disabled={readOnly}
          onCheckedChange={(checked) => patch('marqueeEnabled', checked)}
        />
      </Field>
      {readOnly ? null : (
        <Button type="submit" size="sm">
          {labels.save}
        </Button>
      )}
    </form>
  );
}
