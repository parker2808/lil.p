'use client';

import { qk, type StatsRange } from '@portfolio/contracts';
import { SectionBoundary } from '@portfolio/ui/components/SectionBoundary/SectionBoundary';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { RoleGate } from '@/modules/admin-core/components/RoleGate/RoleGate';
import { LATEST_INBOX_PARAMS } from '@/modules/admin-inbox/services/admin-inbox.service';

import { ContentHealthCard } from '../components/ContentHealthCard/ContentHealthCard';
import { InboxCard } from '../components/InboxCard/InboxCard';
import { RangeToggle } from '../components/RangeToggle/RangeToggle';
import { StatsCards } from '../components/StatsCards/StatsCards';

export function AdminDashboardIndex({ range }: { range: StatsRange }) {
  const t = useTranslations('admin.dashboard');
  const queryClient = useQueryClient();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        <RangeToggle range={range} />
      </div>
      <SectionBoundary
        labels={{
          error: t('stats.error'),
          retry: t('stats.retry'),
          empty: t('stats.empty'),
        }}
        fallback={<StatsSkeleton />}
        onReset={() => {
          void queryClient.resetQueries({ queryKey: qk.admin.stats(range) });
        }}
      >
        <StatsCards range={range} />
      </SectionBoundary>
      <SectionBoundary
        labels={{
          error: t('health.error'),
          retry: t('health.retry'),
          empty: t('health.empty'),
        }}
        fallback={<HealthSkeleton />}
        onReset={() => {
          void queryClient.resetQueries({ queryKey: qk.admin.health });
        }}
      >
        <ContentHealthCard />
      </SectionBoundary>
      <RoleGate allow={['admin']}>
        <SectionBoundary
          labels={{
            error: t('inbox.error'),
            retry: t('inbox.retry'),
            empty: t('inbox.empty'),
          }}
          fallback={<HealthSkeleton />}
          onReset={() => {
            void queryClient.resetQueries({
              queryKey: qk.admin.list('messages', LATEST_INBOX_PARAMS),
            });
          }}
        >
          <InboxCard />
        </SectionBoundary>
      </RoleGate>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}

function HealthSkeleton() {
  return <Skeleton className="h-40 w-full" />;
}
