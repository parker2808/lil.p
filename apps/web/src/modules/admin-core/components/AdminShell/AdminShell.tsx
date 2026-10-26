'use client';

import type { Me } from '@portfolio/contracts';
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
  return (
    <MeProvider me={me}>
      <AdminUiProvider>
        <div className="bg-background text-foreground flex min-h-dvh">
          <AdminLiveEvents />
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar
              crumbs={crumbs}
              actions={
                <>
                  <NotificationBell />
                  <AdminCommandPalette />
                </>
              }
            />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </AdminUiProvider>
    </MeProvider>
  );
}
