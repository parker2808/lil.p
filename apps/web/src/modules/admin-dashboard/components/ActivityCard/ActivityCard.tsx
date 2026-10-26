'use client';

import type { AdminAuditLog } from '@portfolio/contracts';
import { ActivityFeed } from '@portfolio/ui/components/ActivityFeed/ActivityFeed';
import { AuditRow } from '@portfolio/ui/components/AuditRow/AuditRow';
import { Card, CardContent, CardHeader, CardTitle } from '@portfolio/ui/components/ui/card';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAdminAudit } from '@/modules/admin-insights/hooks/use-admin-audit.hook';
import { LATEST_AUDIT_PARAMS } from '@/modules/admin-insights/services/admin-audit.service';

export function ActivityCard() {
  const { data, isError, error } = useAdminAudit(LATEST_AUDIT_PARAMS);
  if (isError) {
    throw error;
  }
  return <ActivityCardView items={data?.items ?? []} />;
}

export function ActivityCardView({ items }: { items: AdminAuditLog[] }) {
  const t = useTranslations('admin.audit');
  const labels = {
    actions: {
      CREATE: t('actions.CREATE'),
      UPDATE: t('actions.UPDATE'),
      PUBLISH: t('actions.PUBLISH'),
      ARCHIVE: t('actions.ARCHIVE'),
      RESTORE: t('actions.RESTORE'),
      LOGIN: t('actions.LOGIN'),
    },
    system: t('system'),
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-ui-title">{t('latest')}</CardTitle>
        <Link href="/admin/audit" className="text-ui">
          {t('viewAll')}
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-ui text-muted-foreground">{t('empty')}</p>
        ) : (
          <ActivityFeed empty={t('empty')}>
            {items.map((item) => (
              <li key={item.id}>
                <AuditRow item={item} labels={labels} />
              </li>
            ))}
          </ActivityFeed>
        )}
      </CardContent>
    </Card>
  );
}
