'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAdminPages } from '../hooks/use-admin-page.hook';

export function AdminPagesIndex() {
  const t = useTranslations('admin.pages');
  const pages = useAdminPages();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ui-title font-semibold">{t('title')}</h1>
      {pages.isError ? <p className="text-destructive">{t('loadError')}</p> : null}
      <ul className="flex flex-col gap-2">
        {(pages.data ?? []).map((page) => (
          <li key={page.key}>
            <Link
              href={`/admin/pages/${page.key}`}
              className="border-border bg-card flex items-center justify-between rounded-md border p-3"
            >
              <span className="text-ui font-medium">{t(`names.${page.key}`)}</span>
              <span className="text-ui-meta text-muted-foreground">
                {t('meta', { count: page.blockCount, date: page.updatedAt.slice(0, 10) })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
