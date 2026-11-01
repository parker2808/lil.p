import type { AdminAuditLog } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';

import { formatDateTime, formatRelativeTime } from './relative-time.util';

const ACTION_VARIANT: Record<
  AdminAuditLog['action'],
  'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'outline'
> = {
  CREATE: 'info',
  UPDATE: 'neutral',
  PUBLISH: 'success',
  ARCHIVE: 'warning',
  RESTORE: 'primary',
  LOGIN: 'outline',
};

export function AuditActionBadge({
  action,
  label,
}: {
  action: AdminAuditLog['action'];
  label: string;
}) {
  return <Badge variant={ACTION_VARIANT[action]}>{label}</Badge>;
}

export function AuditRow({
  item,
  labels,
  now,
  locale = 'en',
  className,
}: {
  item: AdminAuditLog;
  labels: {
    actions: Record<AdminAuditLog['action'], string>;
    system: string;
  };
  now?: number;
  locale?: string;
  className?: string;
}) {
  const absolute = formatDateTime(item.createdAt, locale);
  return (
    <div
      data-slot="audit-row"
      className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2', className)}
    >
      <AuditActionBadge action={item.action} label={labels.actions[item.action]} />
      <span className="text-ui min-w-0 flex-1">{item.summary}</span>
      <span className="text-ui-meta text-muted-foreground">{item.userName ?? labels.system}</span>
      <time
        className="text-ui-meta text-muted-foreground"
        dateTime={item.createdAt}
        title={absolute}
      >
        {formatRelativeTime(item.createdAt, now, locale)}
      </time>
    </div>
  );
}
