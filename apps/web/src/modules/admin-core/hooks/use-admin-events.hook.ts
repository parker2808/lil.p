'use client';

import { qk } from '@portfolio/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { refreshOnce } from '@/modules/core/services/api-client.service';
import { publicApiUrl } from '@/modules/core/utils/public-api-url.util';

import { useIsAdmin } from './use-me.hook';

const REOPEN_MS = 5_000;
const MAX_REFRESH_FAILURES = 3;

type ContactCreated = { id: number; name: string };

export function useAdminEvents(): void {
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('admin.inbox');
  const failures = useRef(0);
  const sourceRef = useRef<EventSource | null>(null);
  const reopenTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    function close(): void {
      sourceRef.current?.close();
      sourceRef.current = null;
      if (reopenTimer.current !== undefined) {
        window.clearTimeout(reopenTimer.current);
      }
    }

    function open(): void {
      close();
      const source = new EventSource(publicApiUrl('/api/admin/events'), {
        withCredentials: true,
      });
      sourceRef.current = source;

      source.addEventListener('contact.created', (event) => {
        let payload: ContactCreated;
        try {
          payload = JSON.parse(String(event.data)) as ContactCreated;
        } catch {
          return;
        }
        queryClient.setQueryData(
          qk.admin.inbox.unread,
          (current: { unread?: number } | undefined) => ({
            unread: (current?.unread ?? 0) + 1,
          }),
        );
        void queryClient.invalidateQueries({ queryKey: qk.admin.all('messages') });
        toast(t('newMessage', { name: payload.name }), {
          action: {
            label: t('open'),
            onClick: () => router.push(`/admin/inbox/${payload.id}`),
          },
        });
      });

      source.onerror = () => {
        source.close();
        sourceRef.current = null;
        reopenTimer.current = window.setTimeout(() => {
          void (async () => {
            const refreshed = await refreshOnce();
            if (refreshed) {
              failures.current = 0;
              open();
              return;
            }
            failures.current += 1;
            if (failures.current >= MAX_REFRESH_FAILURES) {
              // Full navigation so a dead EventSource cannot keep retrying in-place.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.assign('/admin/login?next=/admin/inbox');
              return;
            }
            open();
          })();
        }, REOPEN_MS);
      };
    }

    open();
    return close;
  }, [isAdmin, queryClient, router, t]);
}
