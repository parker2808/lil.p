'use client';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';

const VIEWS = ['grid', 'index'] as const;
type View = (typeof VIEWS)[number];

// Parsed by hand instead of with zod: this island ships on public pages, and zod would add
// about 30 KiB of unused JS to the home page.
function parseView(value: string | null): View {
  return VIEWS.find((view) => view === value) ?? 'grid';
}

export function ProjectsView({ children }: { children: ReactNode }) {
  const search = useSearchParams();
  const pathname = usePathname();
  const view = parseView(search.get('view'));

  function setView(next: View) {
    const query = new URLSearchParams(search.toString());
    query.set('view', next);
    const url = `${pathname}?${query.toString()}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      // Push without a server round trip, so Back restores the previous view.
      window.history.pushState(null, '', url);
    }
  }
  const t = useTranslations('projects');
  return (
    <div className="projects-view col-span-full" data-view={view}>
      <div className="view-switch" role="group" aria-label={t('title')}>
        {VIEWS.map((value) => (
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
