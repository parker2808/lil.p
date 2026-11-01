'use client';

import { EmptyState } from '@portfolio/ui/components/EmptyState/EmptyState';
import { useTranslations } from 'next-intl';

export function AdminInboxIndex() {
  const t = useTranslations('admin.inbox');
  return <EmptyState className="my-auto" title={t('selectMessage')} />;
}
