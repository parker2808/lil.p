'use client';

import type { AdminPage, PageUpdateInput } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { Field, FieldLabel } from '@portfolio/ui/components/ui/field';
import { Input } from '@portfolio/ui/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@portfolio/ui/components/ui/sheet';
import { Textarea } from '@portfolio/ui/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function PageSettingsSheet({
  page,
  readOnly,
  onSave,
}: {
  page: AdminPage;
  readOnly: boolean;
  onSave: (body: PageUpdateInput) => Promise<unknown>;
}) {
  const t = useTranslations('admin.pages');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t('seo')}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>{t('seo')}</SheetTitle>
        <SheetDescription>{t('seoHint')}</SheetDescription>
        <PageSeoFields
          key={page.updatedAt}
          page={page}
          readOnly={readOnly}
          onSave={onSave}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function PageSeoFields({
  page,
  readOnly,
  onSave,
  onClose,
}: {
  page: AdminPage;
  readOnly: boolean;
  onSave: (body: PageUpdateInput) => Promise<unknown>;
  onClose: () => void;
}) {
  const t = useTranslations('admin.pages');
  const [values, setValues] = useState({
    seoTitleEn: page.seoTitleEn ?? '',
    seoTitleVi: page.seoTitleVi ?? '',
    seoDescriptionEn: page.seoDescriptionEn ?? '',
    seoDescriptionVi: page.seoDescriptionVi ?? '',
  });

  return (
    <div className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="seo-title-en">{t('seoTitleEn')}</FieldLabel>
        <Input
          id="seo-title-en"
          value={values.seoTitleEn}
          disabled={readOnly}
          onChange={(event) =>
            setValues((current) => ({ ...current, seoTitleEn: event.target.value }))
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seo-title-vi">{t('seoTitleVi')}</FieldLabel>
        <Input
          id="seo-title-vi"
          value={values.seoTitleVi}
          disabled={readOnly}
          onChange={(event) =>
            setValues((current) => ({ ...current, seoTitleVi: event.target.value }))
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seo-desc-en">{t('seoDescriptionEn')}</FieldLabel>
        <Textarea
          id="seo-desc-en"
          value={values.seoDescriptionEn}
          disabled={readOnly}
          onChange={(event) =>
            setValues((current) => ({ ...current, seoDescriptionEn: event.target.value }))
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="seo-desc-vi">{t('seoDescriptionVi')}</FieldLabel>
        <Textarea
          id="seo-desc-vi"
          value={values.seoDescriptionVi}
          disabled={readOnly}
          onChange={(event) =>
            setValues((current) => ({ ...current, seoDescriptionVi: event.target.value }))
          }
        />
      </Field>
      {readOnly ? null : (
        <Button
          type="button"
          onClick={() => {
            void onSave({
              ...values,
              updatedAt: page.updatedAt,
            }).then(() => onClose());
          }}
        >
          {t('saveSeo')}
        </Button>
      )}
    </div>
  );
}
