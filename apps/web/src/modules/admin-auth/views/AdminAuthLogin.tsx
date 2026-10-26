'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { refreshOnce } from '@/modules/core/services/api-client.service';

import { LoginForm } from '../components/LoginForm/LoginForm';
import { safeAdminNext } from '../utils/safe-next.util';

export function AdminAuthLogin() {
  const t = useTranslations('admin.login');
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
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-title font-semibold">{t('title')}</h1>
          <p className="text-ui text-muted-foreground">{t('intro')}</p>
        </div>
        <LoginForm onSignedIn={() => router.replace(next)} />
      </div>
    </div>
  );
}
