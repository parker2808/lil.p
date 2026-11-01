'use client';

import { StatusPill, type ContentStatus } from '@portfolio/ui/components/StatusPill/StatusPill';
import { Button, buttonVariants } from '@portfolio/ui/components/ui/button';

import { usePublishAction } from '../../stores/admin-ui.store';

export function PublishActions({
  status,
  previewHref,
  disabled,
  busy,
  labels,
  onPublish,
  onUnpublish,
}: {
  status: ContentStatus;
  previewHref: string | null;
  disabled?: boolean;
  busy?: boolean;
  labels: {
    draft: string;
    published: string;
    archived: string;
    publish: string;
    unpublish: string;
    preview: string;
  };
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  usePublishAction(onPublish, status !== 'published' && !disabled && !busy);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill
        status={status}
        labels={{ draft: labels.draft, published: labels.published, archived: labels.archived }}
      />
      {previewHref ? (
        <a href={previewHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          {labels.preview}
        </a>
      ) : null}
      {status === 'published' ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || busy}
          onClick={onUnpublish}
        >
          {labels.unpublish}
        </Button>
      ) : (
        <Button type="button" size="sm" disabled={disabled || busy} onClick={onPublish}>
          {labels.publish}
        </Button>
      )}
    </div>
  );
}
