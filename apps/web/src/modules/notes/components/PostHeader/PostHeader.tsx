import type { PublicPostDetail } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';

const HASH = '#';

export function PostHeader({
  post,
  dateLabel,
  labels,
}: {
  post: PublicPostDetail;
  dateLabel: string;
  labels: { minutes: string; note: string };
}) {
  const primary = post.tags[0];

  return (
    <header className="flex flex-col gap-4">
      <p className="text-eyebrow text-subtle-foreground inline-flex flex-wrap items-center gap-2 font-mono uppercase">
        <span>{labels.note}</span>
        {primary ? (
          <>
            <span aria-hidden>·</span>
            <span>
              {HASH}
              {primary.name}
            </span>
          </>
        ) : null}
      </p>
      <p className="text-meta text-muted-foreground inline-flex items-center gap-2 font-mono">
        <span>{dateLabel}</span>
        <span aria-hidden>·</span>
        <span>
          {post.readingMinutes} {labels.minutes}
        </span>
      </p>
      <h1 className="font-heading text-title font-semibold">{post.title}</h1>
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
    </header>
  );
}
