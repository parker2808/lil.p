import type { PublicPostListItem } from '@portfolio/contracts';
import { PostCard } from '@portfolio/ui/components/PostCard/PostCard';

import { renderAppLink } from '@/modules/blocks/utils/render-app-link.util';

function formatDate(value: string | null, locale: 'en' | 'vi'): string {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

export function PostPrevNext({
  prev,
  next,
  locale,
  minutes,
}: {
  prev: PublicPostListItem | null;
  next: PublicPostListItem | null;
  locale: 'en' | 'vi';
  minutes: string;
}) {
  if (!prev && !next) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {prev ? (
        <PostCard
          post={prev}
          href={`/notes/${prev.slug}`}
          dateLabel={formatDate(prev.publishedAt, locale)}
          labels={{ minutes }}
          renderLink={renderAppLink}
        />
      ) : (
        <span />
      )}
      {next ? (
        <PostCard
          post={next}
          href={`/notes/${next.slug}`}
          dateLabel={formatDate(next.publishedAt, locale)}
          labels={{ minutes }}
          renderLink={renderAppLink}
        />
      ) : null}
    </div>
  );
}
