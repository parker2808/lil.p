import { Alert } from '@portfolio/ui/components/ui/alert';
import { Button } from '@portfolio/ui/components/ui/button';
import type { ReactNode } from 'react';

export function ErrorState({
  message,
  requestId,
  retryLabel,
  onRetry,
}: {
  message: string;
  requestId?: string;
  retryLabel: string;
  onRetry?: () => void;
}): ReactNode {
  return (
    <Alert variant="destructive" className="flex flex-col items-start gap-2">
      <p className="text-ui">{message}</p>
      {requestId ? <p className="text-ui-meta font-mono">{requestId}</p> : null}
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </Alert>
  );
}
