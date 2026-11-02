'use client';

import { createPageSchema, qk, type CreatePageInput } from '@portfolio/contracts';
import { Button } from '@portfolio/ui/components/ui/button';
import { inputClassName } from '@portfolio/ui/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@portfolio/ui/components/ui/dialog';
import { cn } from '@portfolio/ui/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { ApiError } from '@/modules/core/utils/api-error.util';

import { createAdminPage } from '../../services/admin-pages.service';

export function slugFromPageTitle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CreatePageDialog({
  open,
  onOpenChange,
  existingKeys,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingKeys: readonly string[];
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
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = createPageSchema.safeParse({ title, key, locale, template });
    if (!parsed.success) {
      setError(!title.trim() ? t('titleRequired') : t('invalidSlug'));
      return;
    }
    if (existingKeys.includes(key)) {
      setError(t('duplicateSlug'));
      return;
    }
    setPending(true);
    setError('');
    try {
      const page = await createAdminPage(parsed.data as CreatePageInput);
      queryClient.setQueryData(qk.admin.pages.detail(page.key), page);
      void queryClient.invalidateQueries({ queryKey: qk.admin.pages.list });
      onOpenChange(false);
      router.push(`/admin/pages/${page.key}`);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 409 ? t('duplicateSlug') : t('failed'),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
                if (!keyEdited) setKey(slugFromPageTitle(next));
                setError('');
              }}
              maxLength={120}
              className="border-input bg-background h-11 rounded-md border px-3"
            />
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
                setError('');
              }}
              maxLength={64}
              aria-invalid={Boolean(error)}
              aria-describedby="create-page-key-hint"
              className="border-input bg-background h-11 rounded-md border px-3"
            />
            <p id="create-page-key-hint" className="text-ui-meta text-muted-foreground">
              {t('slugHint')}
            </p>
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
          {error ? (
            <p role="alert" className="text-ui text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t('creating') : t('submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
