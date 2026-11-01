'use client';

import { PageHeader } from '@portfolio/ui/components/PageHeader/PageHeader';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useAdminBack } from '@/modules/admin-core/hooks/use-admin-back.hook';

import { useAdminMessage, useInboxMutations } from '../hooks/use-admin-inbox.hook';

export function AdminInboxDetail({ id }: { id: number }) {
  const t = useTranslations('admin.inbox');
  const back = useAdminBack('inbox');
  const { data, isError, isLoading, refetch } = useAdminMessage(id);
  const mutations = useInboxMutations();

  if (isLoading) {
    return <p className="text-ui">{t('loading')}</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-ui">{t('error')}</p>
        <Button type="button" onClick={() => void refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
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
        {data.topic?.labelEn ?? t('noTopic')} · {new Date(data.createdAt).toLocaleString()}
      </p>
      <a href={`mailto:${data.email}`} className="text-ui">
        {t('reply')}
      </a>
      <p className="text-prose whitespace-pre-wrap">{data.message}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => mutations.setStatus.mutate({ id: data.id, status: 'READ' })}
        >
          {t('markRead')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => mutations.setStatus.mutate({ id: data.id, status: 'REPLIED' })}
        >
          {t('markReplied')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => mutations.setStatus.mutate({ id: data.id, status: 'SPAM' })}
        >
          {t('markSpam')}
        </Button>
        <Link href={back.href} className="text-ui hidden sm:inline">
          {t('back')}
        </Link>
      </div>
    </article>
  );
}
