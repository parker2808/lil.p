'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { refreshOnce } from '@/modules/core/services/api-client.service';

import { LoginForm } from '../components/LoginForm/LoginForm';
import { safeAdminNext } from '../utils/safe-next.util';

export function AdminAuthLogin() {
  const t = useTranslations('admin.login');
  const shell = useTranslations('admin.shell');
  const router = useRouter();
  const search = useSearchParams();
  const next = safeAdminNext(search.get('next'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void refreshOnce().then((ok) => {
      if (ok) {
        router.replace(next);
        return;
      }
      setReady(true);
    });
  }, [next, router]);

  if (!ready) {
    return <p className="text-ui text-muted-foreground">{t('checking')}</p>;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <a
        href="#content"
        className="bg-primary text-primary-foreground focus:z-skip sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:px-3 focus:py-2"
      >
        {shell('skip')}
      </a>
      <main id="content" tabIndex={-1} className="flex w-full max-w-sm flex-col gap-6 outline-none">
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-title font-semibold">{t('title')}</h1>
          <p className="text-ui text-muted-foreground">{t('intro')}</p>
        </div>
        <LoginForm onSignedIn={() => router.replace(next)} />
      </main>
    </div>
  );
}
