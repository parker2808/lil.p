'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { LoginForm } from '../components/LoginForm/LoginForm';
import {
  clientHasAdminSession,
  hasAdminLoginAutoRedirected,
  markAdminLoginAutoRedirected,
} from '../utils/client-session.util';
import { safeAdminNext } from '../utils/safe-next.util';

export function AdminAuthLogin() {
  const t = useTranslations('admin.login');
  const shell = useTranslations('admin.shell');
  const router = useRouter();
  const search = useSearchParams();
  const next = safeAdminNext(search.get('next'));
  const [ready, setReady] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current || hasAdminLoginAutoRedirected()) {
      setReady(true);
      return;
    }

    void clientHasAdminSession().then((ok) => {
      if (ok && !redirectedRef.current && !hasAdminLoginAutoRedirected()) {
        redirectedRef.current = true;
        markAdminLoginAutoRedirected();
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
    <div className="admin-login grid min-h-dvh lg:grid-cols-2">
      <a
        href="#content"
        className="bg-primary text-primary-foreground focus:z-skip sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:px-3 focus:py-2"
      >
        {shell('skip')}
      </a>
      <aside className="login-art" aria-hidden>
        <span className="login-mark">{t('workspace')}</span>
        <p>{t('artTitle')}</p>
        <span className="font-mono text-sm">{t('artNote')}</span>
      </aside>
      <main
        id="content"
        tabIndex={-1}
        className="login-form flex w-full max-w-sm flex-col gap-6 self-center justify-self-center px-5 py-12 outline-none"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-title font-semibold">{t('title')}</h1>
          <p className="text-ui text-muted-foreground">{t('intro')}</p>
        </div>
        <LoginForm onSignedIn={() => router.replace(next)} />
      </main>
    </div>
  );
}
