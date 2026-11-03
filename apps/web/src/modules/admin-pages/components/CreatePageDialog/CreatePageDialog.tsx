'use client';

import { createPageSchema, isReservedPublicPageSlug, qk } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { inputClassName } from '@portfolio/ui/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@portfolio/ui/components/ui/dialog';
import { cn } from '@portfolio/ui/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type RefObject } from 'react';

import { ApiError } from '@/modules/core/utils/api-error.util';

import { createAdminPage } from '../../services/admin-pages.service';

export function slugFromPageTitle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CreatePageDialog({
  open,
  onOpenChange,
  existingKeys,
  returnFocusTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingKeys: readonly string[];
  returnFocusTo?: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations('admin.pages.create');
  const currentLocale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [locale, setLocale] = useState<'en' | 'vi'>(currentLocale === 'vi' ? 'vi' : 'en');
  const [template, setTemplate] = useState<'starter' | 'empty'>('starter');
  const [titleError, setTitleError] = useState('');
  const [keyError, setKeyError] = useState('');
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  function titleMessage(value: string): string {
    return createPageSchema.shape.title.safeParse(value).success ? '' : t('titleRequired');
  }

  function keyMessage(value: string): string {
    if (!createPageSchema.shape.key.safeParse(value).success) return t('invalidSlug');
    if (isReservedPublicPageSlug(value) || existingKeys.includes(value)) {
      return t('duplicateSlug');
    }
    return '';
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitleError = titleMessage(title);
    const nextKeyError = keyMessage(key);
    setTitleError(nextTitleError);
    setKeyError(nextKeyError);
    if (nextTitleError || nextKeyError) {
      return;
    }
    const parsed = createPageSchema.safeParse({ title, key, locale, template });
    if (!parsed.success) {
      setFormError(t('failed'));
      return;
    }
    setPending(true);
    setFormError('');
    try {
      const page = await createAdminPage(parsed.data);
      void queryClient.invalidateQueries({ queryKey: qk.admin.pages.list, exact: true });
      queryClient.removeQueries({ queryKey: qk.admin.pages.detail(page.key), exact: true });
      onOpenChange(false);
      router.push(`/admin/pages/${page.key}`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setKeyError(t('duplicateSlug'));
      } else {
        setFormError(t('failed'));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onCloseAutoFocus={(event) => {
          if (returnFocusTo?.current) {
            event.preventDefault();
            returnFocusTo.current.focus();
          }
        }}
      >
        <DialogTitle>{t('title')}</DialogTitle>
        <p className="text-ui text-muted-foreground">{t('hint')}</p>
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="create-page-title" className="text-ui font-medium">
              {t('pageTitle')}
            </label>
            <input
              id="create-page-title"
              autoFocus
              value={title}
              onChange={(event) => {
                const next = event.target.value;
                setTitle(next);
                setTitleError(titleMessage(next));
                if (!keyEdited) {
                  const nextKey = slugFromPageTitle(next);
                  setKey(nextKey);
                  setKeyError(next.trim() ? keyMessage(nextKey) : '');
                }
                setFormError('');
              }}
              onBlur={() => setTitleError(titleMessage(title))}
              maxLength={120}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? 'create-page-title-error' : undefined}
              className="border-input bg-background h-11 rounded-md border px-3"
            />
            {titleError ? (
              <p id="create-page-title-error" role="alert" className="text-ui text-destructive">
                {titleError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="create-page-key" className="text-ui font-medium">
              {t('slug')}
            </label>
            <input
              id="create-page-key"
              value={key}
              onChange={(event) => {
                setKeyEdited(true);
                setKey(event.target.value);
                setKeyError(keyMessage(event.target.value));
                setFormError('');
              }}
              onBlur={() => setKeyError(keyMessage(key))}
              maxLength={64}
              aria-invalid={keyError ? true : undefined}
              aria-describedby={
                keyError ? 'create-page-key-hint create-page-key-error' : 'create-page-key-hint'
              }
              className="border-input bg-background h-11 rounded-md border px-3"
            />
            <p id="create-page-key-hint" className="text-ui-meta text-muted-foreground">
              {t('slugHint')}
            </p>
            {keyError ? (
              <p id="create-page-key-error" role="alert" className="text-ui text-destructive">
                {keyError}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="create-page-locale" className="text-ui font-medium">
                {t('locale')}
              </label>
              <select
                id="create-page-locale"
                value={locale}
                onChange={(event) => setLocale(event.target.value as 'en' | 'vi')}
                className={cn(inputClassName, 'h-11 min-w-0')}
              >
                <option value="en">{t('english')}</option>
                <option value="vi">{t('vietnamese')}</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="create-page-template" className="text-ui font-medium">
                {t('startWith')}
              </label>
              <select
                id="create-page-template"
                value={template}
                onChange={(event) => setTemplate(event.target.value as 'starter' | 'empty')}
                className={cn(inputClassName, 'h-11 min-w-0')}
              >
                <option value="starter">{t('starter')}</option>
                <option value="empty">{t('empty')}</option>
              </select>
            </div>
          </div>
          {formError ? (
            <p role="alert" className="text-ui text-destructive">
              {formError}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" className="min-h-11" disabled={pending}>
              {pending ? t('creating') : t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
