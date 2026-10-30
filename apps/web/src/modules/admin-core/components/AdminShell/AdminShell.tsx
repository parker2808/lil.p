'use client';

import type { Me } from '@portfolio/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useAdminEvents } from '../../hooks/use-admin-events.hook';
import { MeProvider } from '../../hooks/use-me.hook';
import { AdminUiProvider } from '../../stores/admin-ui.store';
import { AdminSidebar } from '../AdminSidebar/AdminSidebar';
import { AdminCommandPalette } from '../CommandPalette/CommandPalette';
import { NotificationBell } from '../NotificationBell/NotificationBell';
import { Topbar } from '../Topbar/Topbar';

function AdminLiveEvents() {
  useAdminEvents();
  return null;
}

export function AdminShell({
  me,
  crumbs,
  children,
}: {
  me: Me;
  crumbs: { label: string }[];
  children: ReactNode;
}) {
  const t = useTranslations('admin.shell');

  return (
    <MeProvider me={me}>
      <AdminUiProvider>
        <div className="bg-background text-foreground admin-shell flex h-dvh overflow-hidden">
          <a
            href="#content"
            className="bg-primary text-primary-foreground focus:z-skip sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:px-3 focus:py-2"
          >
            {t('skip')}
          </a>
          <AdminLiveEvents />
          <AdminSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Topbar
              crumbs={crumbs}
              actions={
                <>
                  <NotificationBell />
                  <AdminCommandPalette />
                </>
              }
            />
            <main
              id="content"
              tabIndex={-1}
              className="admin-main relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6 outline-none"
            >
              {children}
            </main>
          </div>
        </div>
      </AdminUiProvider>
    </MeProvider>
  );
}
