import type { PublicPostListItem, PublicPostListPage } from '@portfolio/contracts';
import { PostCard } from '@portfolio/ui/components/PostCard/PostCard';
import { buttonVariants } from '@portfolio/ui/components/ui/button';
import { Empty } from '@portfolio/ui/components/ui/empty';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationList,
} from '@portfolio/ui/components/ui/pagination';
import type { RenderLink } from '@portfolio/ui/utils/render-link.util';

import { groupPostsByYear, notesHref } from '../../utils/notes-query.util';

function formatDate(value: string | null, locale: 'en' | 'vi'): string {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

export function PostList({
  page,
  featured,
  q,
  tag,
  locale,
  emptyMessage,
  labels,
  renderLink,
}: {
  page: PublicPostListPage;
  featured: PublicPostListItem | null;
  q?: string;
  tag?: string;
  locale: 'en' | 'vi';
  emptyMessage: string;
  labels: {
    minutes: string;
    clear: string;
    previous: string;
    next: string;
    pagination: string;
    results: string;
  };
  renderLink: RenderLink;
}) {
  const items = featured ? page.items.filter((item) => item.id !== featured.id) : page.items;
  const groups = groupPostsByYear(items);
  const pages = Math.ceil(page.total / page.pageSize);
  const filtered = Boolean(q || tag);

  return (
    <div className="col-span-full flex flex-col gap-8">
      <p className="text-meta text-muted-foreground" aria-live="polite">
        {labels.results.replace('{count}', String(page.total))}
      </p>
      {items.length < 1 && !featured ? (
        <Empty
          action={
            filtered
              ? renderLink({
                  href: '/notes',
                  className: buttonVariants({ variant: 'outline', size: 'sm' }),
                  children: labels.clear,
                })
              : undefined
          }
        >
          {emptyMessage}
        </Empty>
      ) : (
        <>
          {featured ? (
            <PostCard
              post={featured}
              href={`/notes/${featured.slug}`}
              dateLabel={formatDate(featured.publishedAt, locale)}
              labels={{ minutes: labels.minutes }}
              variant="featured"
              renderLink={renderLink}
            />
          ) : null}
          {groups.map((group) => (
            <section key={group.year || 'undated'} className="flex flex-col gap-3">
              {group.year ? (
                <h2 className="text-eyebrow text-subtle-foreground font-mono">{group.year}</h2>
              ) : null}
              <ul className="flex flex-col">
                {group.posts.map((post) => (
                  <li key={post.id}>
                    <PostCard
                      post={post}
                      href={`/notes/${post.slug}`}
                      dateLabel={formatDate(post.publishedAt, locale)}
                      labels={{ minutes: labels.minutes }}
                      renderLink={renderLink}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
      {pages > 1 ? (
        <Pagination aria-label={labels.pagination}>
          <PaginationList>
            {page.page > 1 ? (
              <PaginationItem>
                <PaginationLink asChild>
                  {renderLink({
                    href: notesHref({ q, tag, page: page.page - 1 }),
                    children: labels.previous,
                  })}
                </PaginationLink>
              </PaginationItem>
            ) : null}
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
              <PaginationItem key={number}>
                <PaginationLink asChild isActive={number === page.page}>
                  {renderLink({
                    href: notesHref({ q, tag, page: number }),
                    children: number,
                  })}
                </PaginationLink>
              </PaginationItem>
            ))}
            {page.page < pages ? (
              <PaginationItem>
                <PaginationLink asChild>
                  {renderLink({
                    href: notesHref({ q, tag, page: page.page + 1 }),
                    children: labels.next,
                  })}
                </PaginationLink>
              </PaginationItem>
            ) : null}
          </PaginationList>
        </Pagination>
      ) : null}
    </div>
  );
}
