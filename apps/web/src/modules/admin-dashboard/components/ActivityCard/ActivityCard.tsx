'use client';

import type { AdminAuditLog } from '@portfolio/contracts';
import { ActivityFeed } from '@portfolio/ui/components/ActivityFeed/ActivityFeed';
import { AuditRow } from '@portfolio/ui/components/AuditRow/AuditRow';
import { EmptyState } from '@portfolio/ui/components/EmptyState/EmptyState';
import { useLocale, useTranslations } from 'next-intl';

import { useAdminAudit } from '@/modules/admin-insights/hooks/use-admin-audit.hook';
import { LATEST_AUDIT_PARAMS } from '@/modules/admin-insights/services/admin-audit.service';

import { DashboardCard } from '../ActionCards/ActionCards';

export function ActivityCard() {
  const { data } = useAdminAudit(LATEST_AUDIT_PARAMS);
  return <ActivityCardView items={data.items} />;
}

export function ActivityCardView({ items }: { items: AdminAuditLog[] }) {
  const t = useTranslations('admin.audit');
  const locale = useLocale();
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
    <DashboardCard title={t('latest')} action={t('viewAll')} href="/admin/audit">
      {items.length === 0 ? (
        <EmptyState title={t('empty')} className="flex-1 py-6" />
      ) : (
        <ActivityFeed empty={t('empty')}>
          {items.map((item) => (
            <li key={item.id}>
              <AuditRow item={item} labels={labels} locale={locale} />
            </li>
          ))}
        </ActivityFeed>
      )}
    </DashboardCard>
  );
}
