'use client';

import type { AdminContactMessage } from '@portfolio/contracts';
import { formatDateTime } from '@portfolio/ui/components/AuditRow/relative-time.util';
import { PageHeader } from '@portfolio/ui/components/PageHeader/PageHeader';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { AdminLoadError } from '@/modules/admin-core/components/AdminLoadError/AdminLoadError';
import { useAdminBack } from '@/modules/admin-core/hooks/use-admin-back.hook';
import { useIsAdmin } from '@/modules/admin-core/hooks/use-me.hook';
import { toastUndo } from '@/modules/core/utils/toast-undo.util';

import { useAdminMessage, useInboxMutations } from '../hooks/use-admin-inbox.hook';

function replyHref(message: AdminContactMessage): string {
  const subject = message.topic
    ? `?subject=${encodeURIComponent(`Re: ${message.topic.labelEn}`)}`
    : '';
  return `mailto:${message.email}${subject}`;
}

export function AdminInboxDetail({ id }: { id: number }) {
  const t = useTranslations('admin.inbox');
  const locale = useLocale();
  const router = useRouter();
  const query = useSearchParams().toString();
  const back = useAdminBack('inbox');
  const canWrite = useIsAdmin();
  const { data, isError, isLoading, refetch } = useAdminMessage(id);
  const { mutate: setStatus } = useInboxMutations().setStatus;
  const markedRead = useRef<number | null>(null);

  useEffect(() => {
    if (!canWrite || !data || data.status !== 'NEW' || markedRead.current === data.id) {
      return;
    }
    markedRead.current = data.id;
    setStatus({ id: data.id, status: 'READ' });
  }, [canWrite, data, setStatus]);

  if (isLoading) {
    return <p className="text-ui">{t('loading')}</p>;
  }

  if (isError || !data) {
    return <AdminLoadError navKey="inbox" message={t('error')} onRetry={() => void refetch()} />;
  }

  function archive(message: AdminContactMessage) {
    const previous = message.status;
    setStatus({ id: message.id, status: 'ARCHIVED' });
    toastUndo(t('archived'), () => setStatus({ id: message.id, status: previous }));
    router.replace(`/admin/inbox${query ? `?${query}` : ''}`);
  }

  return (
    <article className="flex max-w-3xl flex-col gap-4">
      <PageHeader
        title={data.name}
        back={back}
        linkComponent={Link}
        actions={<Badge>{t(`status.${data.status}`)}</Badge>}
      />
      <p className="text-ui-meta text-muted-foreground">
        {data.email} · {data.topic?.labelEn ?? t('noTopic')} ·{' '}
        <time dateTime={data.createdAt}>{formatDateTime(data.createdAt, locale)}</time>
      </p>
      <p className="text-prose whitespace-pre-wrap">{data.message}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={replyHref(data)}>{t('reply')}</a>
        </Button>
        {canWrite ? (
          <>
            {data.status === 'ARCHIVED' ? null : (
              <Button type="button" size="sm" variant="outline" onClick={() => archive(data)}>
                {t('archive')}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setStatus({ id: data.id, status: 'REPLIED' })}
            >
              {t('markReplied')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setStatus({ id: data.id, status: 'SPAM' })}
            >
              {t('markSpam')}
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
