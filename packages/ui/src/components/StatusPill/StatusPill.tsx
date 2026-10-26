import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';
import { Archive, Circle, CircleDot } from 'lucide-react';

export type ContentStatus = 'draft' | 'published' | 'archived';

const ICONS = {
  draft: Circle,
  published: CircleDot,
  archived: Archive,
} as const;

const VARIANTS = {
  draft: 'neutral',
  published: 'success',
  archived: 'outline',
} as const;

export function StatusPill({
  status,
  labels,
  className,
}: {
  status: ContentStatus;
  labels: Record<ContentStatus, string>;
  className?: string;
}) {
  const Glyph = ICONS[status];

  return (
    <Badge variant={VARIANTS[status]} className={cn('normal-case', className)}>
      <Glyph aria-hidden className="size-3" />
      {labels[status]}
    </Badge>
  );
}
