import type { PublicPostListItem } from '@portfolio/contracts';
import { CoverPlaceholder } from '@portfolio/ui/components/CoverPlaceholder/CoverPlaceholder';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';
import {
  CARD_ARROW,
  CARD_INTERACTIVE,
  CARD_TITLE_LINK,
} from '@portfolio/ui/utils/card-chrome.util';
import { defaultRenderLink, type RenderLink } from '@portfolio/ui/utils/render-link.util';
import { ArrowUpRight } from 'lucide-react';

const HASH = '#';

export function PostCard({
  post,
  href,
  dateLabel,
  labels,
  variant = 'row',
  renderLink = defaultRenderLink,
  className,
}: {
  post: PublicPostListItem;
  href: string;
  dateLabel: string;
  labels: { minutes: string };
  variant?: 'row' | 'featured';
  renderLink?: RenderLink;
  className?: string;
}) {
  const featured = variant === 'featured';

  return (
    <article
      data-slot="post-card"
      data-variant={variant}
      data-lang={post.lang}
      className={cn(
        'redesign-post-card',
        CARD_INTERACTIVE,
        featured ? 'flex flex-col' : 'block px-5 py-4',
        className,
      )}
    >
      <ArrowUpRight aria-hidden className={CARD_ARROW} />
      {featured ? <CoverPlaceholder hue="VIOLET" className="border-b" /> : null}
      <div className={cn(featured && 'p-5')}>
        <p className="text-eyebrow text-subtle-foreground mb-1.5 inline-flex items-center gap-2 font-mono uppercase">
          <span>{dateLabel}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex gap-1">
            <span>{post.readingMinutes}</span>
            <span>{labels.minutes}</span>
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2 pr-7">
          <h3>{renderLink({ href, className: CARD_TITLE_LINK, children: post.title })}</h3>
          {post.lang === 'en' ? (
            <Badge variant="outline" data-slot="lang-badge">
              {post.lang.toUpperCase()}
            </Badge>
          ) : null}
        </div>
        <p className="text-body text-muted-foreground clamp-marks mt-2 mb-2.5 line-clamp-2">
          {post.excerpt}
        </p>
        {post.tags.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li key={tag.slug}>
                <Badge variant="neutral" className="normal-case">
                  {HASH}
                  {tag.name}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
