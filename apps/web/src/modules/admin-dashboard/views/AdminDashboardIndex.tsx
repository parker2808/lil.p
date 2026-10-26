'use client';

import { useTranslations } from 'next-intl';

import { RoleGate } from '@/modules/admin-core/components/RoleGate/RoleGate';
import { useMe } from '@/modules/admin-core/hooks/use-me.hook';

export function AdminDashboardIndex() {
  const t = useTranslations('admin.dashboard');
  const me = useMe();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-ui-title font-semibold">{t('title')}</h1>
      <p className="text-ui text-muted-foreground">{t('placeholder', { name: me.name })}</p>
      <RoleGate allow={['admin']}>
        <p className="text-ui-meta text-muted-foreground">{t('adminHint')}</p>
      </RoleGate>
    </div>
  );
}
