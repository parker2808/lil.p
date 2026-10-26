import type { PublicTag } from '@portfolio/contracts';
import { defaultRenderLink, type RenderLink } from '@portfolio/ui/utils/render-link.util';

import { notesHref } from '../../utils/notes-query.util';

const HASH = '#';

export function TagFilter({
  tags,
  activeSlug,
  q,
  labels,
  renderLink = defaultRenderLink,
}: {
  tags: PublicTag[];
  activeSlug?: string;
  q?: string;
  labels: { all: string };
  renderLink?: RenderLink;
}) {
  const total = tags.reduce((sum, tag) => sum + tag.postCount, 0);
  const pills = [
    { slug: undefined as string | undefined, name: labels.all, count: total },
    ...tags.map((tag) => ({ slug: tag.slug, name: `${HASH}${tag.name}`, count: tag.postCount })),
  ];

  return (
    <ul className="col-span-full flex flex-wrap gap-2">
      {pills.map((pill) => {
        const active = pill.slug === activeSlug;
        return (
          <li key={pill.slug ?? 'all'}>
            {renderLink({
              href: notesHref({ q, tag: pill.slug }),
              className: [
                'text-meta inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1',
                active
                  ? 'border-border-strong bg-accent text-accent-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-border-strong',
              ].join(' '),
              children: (
                <>
                  <span>{pill.name}</span>
                  <span className="font-mono">{pill.count}</span>
                </>
              ),
            })}
          </li>
        );
      })}
    </ul>
  );
}
