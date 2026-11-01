import { cn } from '@portfolio/ui/lib/utils';
import { ArrowLeft, Slash } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export type PageHeaderLinkProps = {
  href: string;
  className?: string;
  'aria-label'?: string;
  children?: ReactNode;
};

export type PageHeaderBack = {
  href: string;
  label: string;
  ariaLabel?: string;
};

export function PageHeader({
  title,
  back,
  backPlacement = 'stacked',
  actions,
  linkComponent: LinkComponent = 'a',
  className,
}: {
  title: ReactNode;
  back?: PageHeaderBack;
  backPlacement?: 'stacked' | 'inline';
  actions?: ReactNode;
  linkComponent?: ComponentType<PageHeaderLinkProps> | 'a';
  className?: string;
}) {
  const inline = backPlacement === 'inline';
  const backLink = back ? (
    <LinkComponent
      href={back.href}
      aria-label={back.ariaLabel}
      className={cn(
        'text-ui text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-1.5 rounded-md outline-none focus-visible:ring-2',
        inline ? 'shrink-0' : 'self-start sm:hidden',
      )}
    >
      <ArrowLeft aria-hidden data-slot="page-header-back-icon" className="size-4" />
      {back.label}
    </LinkComponent>
  ) : null;

  return (
    <header data-slot="page-header" className={cn('flex flex-col gap-2', className)}>
      {inline ? null : backLink}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {inline && backLink ? (
            <>
              {backLink}
              <Slash aria-hidden className="text-muted-foreground size-3.5 shrink-0" />
            </>
          ) : null}
          <h1
            className="text-heading min-w-0 truncate font-semibold"
            title={typeof title === 'string' ? title : undefined}
          >
            {title}
          </h1>
        </div>
        {actions}
      </div>
    </header>
  );
}
