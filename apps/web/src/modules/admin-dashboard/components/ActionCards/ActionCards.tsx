'use client';

import { type AdminStats, qk, type StatsRange } from '@portfolio/contracts';
import { EmptyState } from '@portfolio/ui/components/EmptyState/EmptyState';
import { Sparkline } from '@portfolio/ui/components/Sparkline/Sparkline';
import { Card, CardContent, CardHeader, CardTitle } from '@portfolio/ui/components/ui/card';
import { cn } from '@portfolio/ui/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { type ReactNode, useId } from 'react';

import { fetchUnreadCount } from '@/modules/admin-inbox/services/admin-inbox.service';

import { useAdminStats } from '../../hooks/use-dashboard.hook';
import { formatCount, statsDelta } from '../../utils/stats-delta.util';

const DELTA_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;

export function DashboardCard({
  title,
  href,
  action,
  className,
  children,
}: {
  title: string;
  href: string;
  action: string;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <Card
      surface="admin"
      role="region"
      aria-labelledby={titleId}
      data-slot="dashboard-card"
      className={cn('flex h-full flex-col', className)}
    >
      <CardHeader surface="admin" className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle id={titleId} className="text-ui-title">
          {title}
        </CardTitle>
        <Link href={href} className="text-ui shrink-0">
          {action}
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-4">{children}</CardContent>
    </Card>
  );
}

function CardEmpty({ title, description }: { title: string; description: string }) {
  return <EmptyState title={title} description={description} className="flex-1 py-6" />;
}

export function UnreadCard({ range }: { range: StatsRange }) {
  const { data: stats } = useAdminStats(range);
  const live = useQuery({ queryKey: qk.admin.inbox.unread, queryFn: fetchUnreadCount });
  return <UnreadCardView unread={live.data?.unread ?? stats.messages.unread} />;
}

export function UnreadCardView({ unread }: { unread: number }) {
  const t = useTranslations('admin.dashboard.todos.unread');
  return (
    <DashboardCard
      title={t('title')}
      action={t('action')}
      href={unread > 0 ? '/admin/inbox?status=NEW' : '/admin/inbox'}
    >
      {unread > 0 ? (
        <p className="dashboard-metric">{formatCount(unread)}</p>
      ) : (
        <CardEmpty title={t('emptyTitle')} description={t('emptyDescription')} />
      )}
    </DashboardCard>
  );
}

export function DraftsCard({ range }: { range: StatsRange }) {
  const { data } = useAdminStats(range);
  return <DraftsCardView stats={data} />;
}

export function DraftsCardView({ stats }: { stats: Pick<AdminStats, 'projects' | 'posts'> }) {
  const t = useTranslations('admin.dashboard.todos.drafts');
  const projects = stats.projects.draft;
  const posts = stats.posts.draft;
  const lists = [
    { key: 'projects', count: projects, href: '/admin/projects?status=DRAFT' },
    { key: 'posts', count: posts, href: '/admin/posts?status=DRAFT' },
  ] as const;
  const primary = posts > projects ? lists[1] : lists[0];

  return (
    <DashboardCard title={t('title')} action={t('action')} href={primary.href}>
      {projects + posts > 0 ? (
        <>
          <p className="dashboard-metric">{formatCount(projects + posts)}</p>
          <ul className="flex flex-col gap-1">
            {lists
              .filter((list) => list.count > 0)
              .map((list) => (
                <li key={list.key}>
                  <Link href={list.href} className="text-ui hover:text-primary">
                    {t(list.key, { count: list.count })}
                  </Link>
                </li>
              ))}
          </ul>
        </>
      ) : (
        <CardEmpty title={t('emptyTitle')} description={t('emptyDescription')} />
      )}
    </DashboardCard>
  );
}

export function ViewsCard({ range }: { range: StatsRange }) {
  const { data } = useAdminStats(range);
  return <ViewsCardView stats={data} />;
}

export function ViewsCardView({ stats }: { stats: Pick<AdminStats, 'range' | 'views'> }) {
  const t = useTranslations('admin.dashboard');
  const { total, previousTotal, byDay } = stats.views;
  const delta = statsDelta(total, previousTotal);
  const Icon = DELTA_ICON[delta.direction];

  return (
    <DashboardCard
      title={t('cards.views', { range: stats.range })}
      action={t('todos.views.action')}
      href={stats.range === '30d' ? '/admin/analytics' : `/admin/analytics?range=${stats.range}`}
    >
      {total > 0 || previousTotal > 0 ? (
        <>
          <p className="dashboard-metric">{formatCount(total)}</p>
          <p className="text-ui-meta text-muted-foreground flex items-center gap-1">
            <Icon aria-hidden className="size-3.5 shrink-0" />
            <span>
              {delta.direction === 'flat'
                ? t('delta.flat', { range: stats.range })
                : t(`delta.${delta.direction}`, {
                    value: formatCount(delta.amount),
                    range: stats.range,
                  })}
            </span>
          </p>
          <div className="text-chart-1 mt-auto">
            <Sparkline values={byDay.map((day) => day.views)} label={t('cards.viewsSparkline')} />
          </div>
        </>
      ) : (
        <CardEmpty
          title={t('todos.views.emptyTitle')}
          description={t('todos.views.emptyDescription')}
        />
      )}
    </DashboardCard>
  );
}
