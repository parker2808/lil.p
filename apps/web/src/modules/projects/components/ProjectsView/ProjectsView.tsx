'use client';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { useListParams } from '@/modules/admin-core/hooks/use-list-params.hook';

const VIEWS = ['grid', 'index'] as const;
const viewParamsSchema = z.looseObject({ view: z.enum(VIEWS).catch('grid') });

export function ProjectsView({ children }: { children: ReactNode }) {
  const { params, setParams } = useListParams(viewParamsSchema);
  const view = params.view;
  const t = useTranslations('projects');
  return (
    <div className="projects-view col-span-full" data-view={view}>
      <div className="view-switch" role="group" aria-label={t('title')}>
        {VIEWS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setParams({ view: value }, { history: 'push' })}
          >
            {t(value)}
          </button>
        ))}
      </div>
      <div className="projects-results grid gap-6 md:grid-cols-2">{children}</div>
    </div>
  );
}
