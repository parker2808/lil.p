'use client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ProjectsView({ children }: { children: ReactNode }) {
  const [view, setView] = useState('grid');
  const t = useTranslations('projects');
  return (
    <div className="projects-view col-span-full" data-view={view}>
      <div className="view-switch" role="group" aria-label={t('title')}>
        {['grid', 'index'].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
          >
            {t(value)}
          </button>
        ))}
      </div>
      <div className="projects-results grid gap-6 md:grid-cols-2">{children}</div>
    </div>
  );
}
