'use client';

import { qk, type StatsRange } from '@portfolio/contracts';
import {
  SectionBoundary,
  type SectionBoundaryLabels,
} from '@portfolio/ui/components/SectionBoundary/SectionBoundary';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { cn } from '@portfolio/ui/lib/utils';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { RoleGate } from '@/modules/admin-core/components/RoleGate/RoleGate';
import { LATEST_AUDIT_PARAMS } from '@/modules/admin-insights/services/admin-audit.service';

import { DraftsCard, UnreadCard, ViewsCard } from '../components/ActionCards/ActionCards';
import { ActivityCard } from '../components/ActivityCard/ActivityCard';
import { ContentHealthCard } from '../components/ContentHealthCard/ContentHealthCard';
import { RangeToggle } from '../components/RangeToggle/RangeToggle';

export function AdminDashboardIndex({ range }: { range: StatsRange }) {
  const t = useTranslations('admin.dashboard');
  const labels = (section: 'stats' | 'health' | 'inbox' | 'activity') => ({
    error: t(`${section}.error`),
    retry: t(`${section}.retry`),
    empty: t(`${section}.empty`),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        <RangeToggle range={range} />
      </div>
      <div data-slot="dashboard-grid" className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <RoleGate allow={['admin']}>
          <DashboardCell
            className="lg:col-span-4"
            labels={labels('inbox')}
            queryKey={qk.admin.stats(range)}
          >
            <UnreadCard range={range} />
          </DashboardCell>
        </RoleGate>
        <DashboardCell
          className="lg:col-span-4"
          labels={labels('stats')}
          queryKey={qk.admin.stats(range)}
        >
          <DraftsCard range={range} />
        </DashboardCell>
        <DashboardCell
          className="lg:col-span-4"
          labels={labels('stats')}
          queryKey={qk.admin.stats(range)}
        >
          <ViewsCard range={range} />
        </DashboardCell>
        <RoleGate allow={['admin']}>
          <DashboardCell
            className="lg:col-span-8"
            labels={labels('activity')}
            queryKey={qk.admin.audit(LATEST_AUDIT_PARAMS)}
          >
            <ActivityCard />
          </DashboardCell>
        </RoleGate>
        <DashboardCell
          className="lg:col-span-4"
          labels={labels('health')}
          queryKey={qk.admin.health}
        >
          <ContentHealthCard />
        </DashboardCell>
      </div>
    </div>
  );
}

function DashboardCell({
  className,
  labels,
  queryKey,
  children,
}: {
  className: string;
  labels: SectionBoundaryLabels;
  queryKey: QueryKey;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  return (
    <div className={cn('min-w-0', className)}>
      <SectionBoundary
        labels={labels}
        fallback={<Skeleton className="h-full min-h-40 w-full" />}
        onReset={() => {
          void queryClient.resetQueries({ queryKey });
        }}
      >
        {children}
      </SectionBoundary>
    </div>
  );
}
