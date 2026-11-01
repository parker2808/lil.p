'use client';

import type { AdminContactMessage } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portfolio/ui/components/ui/card';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAdminMessages } from '@/modules/admin-inbox/hooks/use-admin-inbox.hook';
import { LATEST_INBOX_PARAMS } from '@/modules/admin-inbox/services/admin-inbox.service';

export function InboxCard() {
  const { data, isError, error } = useAdminMessages(LATEST_INBOX_PARAMS);
  if (isError) {
    throw error;
  }
  return <InboxCardView items={data?.items ?? []} />;
}

export function InboxCardView({ items }: { items: AdminContactMessage[] }) {
  const t = useTranslations('admin.inbox');

  return (
    <Card surface="admin">
      <CardHeader surface="admin" className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-ui-title">{t('latest')}</CardTitle>
        <Link href="/admin/inbox" className="text-ui">
          {t('viewAll')}
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-ui text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/inbox/${item.id}`}
                  className="text-ui hover:text-primary flex flex-wrap items-baseline gap-x-2"
                >
                  <span className="font-medium">{item.name}</span>
                  <Badge variant={item.status === 'NEW' ? 'primary' : 'neutral'}>
                    {t(`status.${item.status}`)}
                  </Badge>
                  <span className="text-ui-meta text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
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
