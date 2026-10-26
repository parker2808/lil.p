'use client';

import type { AdminStats, StatsRange } from '@portfolio/contracts';
import { StatCard } from '@portfolio/ui/components/StatCard/StatCard';
import { useTranslations } from 'next-intl';

import { useAdminStats } from '../../hooks/use-dashboard.hook';
import { formatCount, statsDelta } from '../../utils/stats-delta.util';

export function StatsCards({ range }: { range: StatsRange }) {
  const { data } = useAdminStats(range);
  return <StatsCardsView stats={data} />;
}

export function StatsCardsView({ stats }: { stats: AdminStats }) {
  const t = useTranslations('admin.dashboard');
  const cards = [
    {
      key: 'projects',
      label: t('cards.projects'),
      value: stats.projects.published,
      current: stats.projects.publishedInRange,
      previous: stats.projects.publishedInPrevious,
    },
    {
      key: 'posts',
      label: t('cards.posts'),
      value: stats.posts.published,
      current: stats.posts.publishedInRange,
      previous: stats.posts.publishedInPrevious,
    },
    {
      key: 'drafts',
      label: t('cards.drafts'),
      value: stats.projects.draft + stats.posts.draft,
    },
    {
      key: 'publishedPeriod',
      label: t('cards.publishedPeriod'),
      value: stats.projects.publishedInRange + stats.posts.publishedInRange,
      current: stats.projects.publishedInRange + stats.posts.publishedInRange,
      previous: stats.projects.publishedInPrevious + stats.posts.publishedInPrevious,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const delta =
          'current' in card && card.current !== undefined && card.previous !== undefined
            ? statsDelta(card.current, card.previous)
            : null;
        return (
          <StatCard
            key={card.key}
            label={card.label}
            value={formatCount(card.value)}
            delta={
              delta
                ? {
                    direction: delta.direction,
                    text:
                      delta.direction === 'flat'
                        ? t('delta.flat', { range: stats.range })
                        : t(`delta.${delta.direction}`, {
                            value: formatCount(delta.amount),
                            range: stats.range,
                          }),
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
