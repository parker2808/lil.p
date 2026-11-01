import type {
  PageHeaderBack,
  PageHeaderLinkProps,
} from '@portfolio/ui/components/PageHeader/PageHeader';
import { Alert } from '@portfolio/ui/components/ui/alert';
import { Button, buttonVariants } from '@portfolio/ui/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export function ErrorState({
  message,
  requestId,
  retryLabel,
  onRetry,
  back,
  linkComponent: LinkComponent = 'a',
}: {
  message: string;
  requestId?: string;
  retryLabel: string;
  onRetry?: () => void;
  back?: PageHeaderBack;
  linkComponent?: ComponentType<PageHeaderLinkProps> | 'a';
}): ReactNode {
  return (
    <Alert variant="destructive" className="flex flex-col items-start gap-2">
      <p className="text-ui">{message}</p>
      {requestId ? <p className="text-ui-meta font-mono">{requestId}</p> : null}
      {onRetry || back ? (
        <div className="flex flex-wrap items-center gap-2">
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {back ? (
            <LinkComponent
              href={back.href}
              aria-label={back.ariaLabel}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              <ArrowLeft aria-hidden className="size-4" />
              {back.label}
            </LinkComponent>
          ) : null}
        </div>
      ) : null}
    </Alert>
  );
}
