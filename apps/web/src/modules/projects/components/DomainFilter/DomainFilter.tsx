import type { PublicDomain } from '@portfolio/contracts';
import { HUE_DOT } from '@portfolio/ui/utils/hue.util';
import { defaultRenderLink, type RenderLink } from '@portfolio/ui/utils/render-link.util';

import { projectsHref } from '../../utils/projects-query.util';

export function DomainFilter({
  domains,
  activeSlug,
  skill,
  labels,
  renderLink = defaultRenderLink,
}: {
  domains: PublicDomain[];
  activeSlug?: string;
  skill?: string;
  labels: { all: string };
  renderLink?: RenderLink;
}) {
  const total = domains.reduce((sum, domain) => sum + domain.projectCount, 0);
  const pills = [
    { slug: undefined as string | undefined, name: labels.all, count: total, hue: null },
    ...domains.map((domain) => ({
      slug: domain.slug,
      name: domain.name,
      count: domain.projectCount,
      hue: domain.hue,
    })),
  ];

  return (
    <div className="relative min-w-0 flex-1">
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {pills.map((pill) => {
          const href = projectsHref({ domain: pill.slug, skill });
          const active = pill.slug === activeSlug;
          return (
            <li key={pill.slug ?? 'all'} className="shrink-0">
              {renderLink({
                href,
                className: [
                  'text-meta inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1',
                  active
                    ? 'border-border-strong bg-accent text-accent-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-border-strong',
                ].join(' '),
                children: (
                  <>
                    {pill.hue ? (
                      <span aria-hidden className={`size-2 rounded-full ${HUE_DOT[pill.hue]}`} />
                    ) : null}
                    <span>{pill.name}</span>
                    <span className="font-mono">{pill.count}</span>
                  </>
                ),
              })}
            </li>
          );
        })}
      </ul>
      <span
        aria-hidden
        className="from-background pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l md:hidden"
      />
    </div>
  );
}
