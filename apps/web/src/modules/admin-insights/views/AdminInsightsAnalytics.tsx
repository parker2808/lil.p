'use client';

import { qk, type StatsRange } from '@portfolio/contracts';
import { SectionBoundary } from '@portfolio/ui/components/SectionBoundary/SectionBoundary';
import { ViewsAreaChart } from '@portfolio/ui/components/ui/chart';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { RangeToggle } from '@/modules/admin-dashboard/components/RangeToggle/RangeToggle';
import { useAdminStats } from '@/modules/admin-dashboard/hooks/use-dashboard.hook';
import { formatCount } from '@/modules/admin-dashboard/utils/stats-delta.util';

export function AdminInsightsAnalytics({ range }: { range: StatsRange }) {
  const t = useTranslations('admin.analytics');
  const queryClient = useQueryClient();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-ui-title font-semibold">{t('title')}</h1>
        <RangeToggle
          range={range}
          hrefFor={(next) =>
            next === '30d' ? '/admin/analytics' : `/admin/analytics?range=${next}`
          }
        />
      </div>
      <SectionBoundary
        labels={{ error: t('error'), retry: t('retry'), empty: t('empty') }}
        fallback={<Skeleton className="h-64 w-full" />}
        onReset={() => {
          void queryClient.resetQueries({ queryKey: qk.admin.stats(range) });
        }}
      >
        <AnalyticsChart range={range} />
      </SectionBoundary>
    </div>
  );
}

function AnalyticsChart({ range }: { range: StatsRange }) {
  const { data } = useAdminStats(range);
  const t = useTranslations('admin.analytics');

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <p className="text-ui-meta text-muted-foreground">
          {t('views', { count: formatCount(data.views.total) })}
        </p>
        <p className="text-ui-meta text-muted-foreground">
          {t('visitors', { count: formatCount(data.views.uniqueVisitors) })}
        </p>
      </div>
      <ViewsAreaChart data={data.views.byDay} viewsLabel={t('series')} />
      <table className="sr-only">
        <caption>{t('tableCaption')}</caption>
        <thead>
          <tr>
            <th>{t('date')}</th>
            <th>{t('series')}</th>
            <th>{t('visitorsHead')}</th>
          </tr>
        </thead>
        <tbody>
          {data.views.byDay.map((day) => (
            <tr key={day.date}>
              <td>{day.date}</td>
              <td>{day.views}</td>
              <td>{day.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid gap-6 md:grid-cols-2">
        <TopList
          title={t('topPages')}
          empty={t('noPages')}
          items={data.views.topPages.map((item) => ({ label: item.path, views: item.views }))}
        />
        <TopList
          title={t('topReferrers')}
          empty={t('noReferrers')}
          items={data.views.topReferrers.map((item) => ({ label: item.host, views: item.views }))}
        />
      </div>
    </div>
  );
}

function TopList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ label: string; views: number }>;
}) {
  return (
    <section>
      <h2 className="text-ui-title mb-3 font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-ui-meta text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.label} className="text-ui-meta flex justify-between gap-3">
              <span className="truncate">{item.label}</span>
              <span className="tabular-nums">{formatCount(item.views)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
