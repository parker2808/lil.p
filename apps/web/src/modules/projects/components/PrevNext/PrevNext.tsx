import type { PublicProjectListItem } from '@portfolio/contracts';

import { Link } from '@i18n/navigation';

export function PrevNext({
  prev,
  next,
  labels,
}: {
  prev: PublicProjectListItem | null;
  next: PublicProjectListItem | null;
  labels: { previous: string; next: string };
}) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav className="border-border flex flex-col gap-4 border-t pt-8 sm:flex-row sm:justify-between">
      {prev ? (
        <Link href={`/projects/${prev.slug}`} className="text-body hover:text-primary">
          <span className="text-eyebrow text-subtle-foreground block font-mono uppercase">
            {labels.previous}
          </span>
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/projects/${next.slug}`}
          className="text-body hover:text-primary sm:text-right"
        >
          <span className="text-eyebrow text-subtle-foreground block font-mono uppercase">
            {labels.next}
          </span>
          {next.title}
        </Link>
      ) : null}
    </nav>
  );
}
