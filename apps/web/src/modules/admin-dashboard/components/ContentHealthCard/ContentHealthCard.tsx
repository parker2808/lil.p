'use client';

import type { AdminHealth, AdminHealthIssue } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portfolio/ui/components/ui/card';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useAdminHealth } from '../../hooks/use-dashboard.hook';

export function ContentHealthCard() {
  const { data } = useAdminHealth();
  return <ContentHealthCardView health={data} />;
}

export function ContentHealthCardView({ health }: { health: AdminHealth }) {
  const t = useTranslations('admin.dashboard.health');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-ui-title">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={health.summary.drafts > 0 ? 'warning' : 'outline'}>
            {t('drafts', { count: health.summary.drafts })}
          </Badge>
          <Badge variant={health.summary.missingVi > 0 ? 'warning' : 'outline'}>
            {t('missingVi', { count: health.summary.missingVi })}
          </Badge>
          <Badge variant={health.summary.noDomain > 0 ? 'warning' : 'outline'}>
            {t('noDomain', { count: health.summary.noDomain })}
          </Badge>
          <Badge variant={health.summary.fewKeyFacts > 0 ? 'warning' : 'outline'}>
            {t('fewKeyFacts', { count: health.summary.fewKeyFacts })}
          </Badge>
          <Badge variant={health.summary.marqueeCount < 6 ? 'warning' : 'outline'}>
            {t('marquee', { count: health.summary.marqueeCount })}
          </Badge>
          <Badge variant={health.summary.publishLint > 0 ? 'warning' : 'outline'}>
            {t('publishLint', { count: health.summary.publishLint })}
          </Badge>
          <Badge variant={health.summary.missingAlt > 0 ? 'warning' : 'outline'}>
            {t('missingAlt', { count: health.summary.missingAlt })}
          </Badge>
        </div>
        {health.issues.length === 0 ? (
          <p className="text-ui text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {health.issues.map((issue) => (
              <li key={issueKey(issue)}>
                <Link
                  href={issue.href}
                  className="text-ui hover:text-primary flex flex-wrap items-baseline gap-x-2"
                >
                  <span className="font-medium">{issueTitle(issue, t)}</span>
                  <span className="text-ui-meta text-muted-foreground">
                    {issueDetail(issue, t)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function issueKey(issue: AdminHealthIssue): string {
  return `${issue.kind}:${issue.entity}:${issue.id ?? 'all'}:${issue.href}`;
}

function issueTitle(
  issue: AdminHealthIssue,
  t: ReturnType<typeof useTranslations<'admin.dashboard.health'>>,
): string {
  return issue.kind === 'MARQUEE_SKILLS' ? t('marqueeTitle') : issue.title;
}

function issueDetail(
  issue: AdminHealthIssue,
  t: ReturnType<typeof useTranslations<'admin.dashboard.health'>>,
): string {
  const fields = issue.fields?.join(', ') ?? '';
  const count = issue.count ?? 0;
  return t(`kinds.${issue.kind}`, { count, fields });
}
