import { cn } from '@portfolio/ui/lib/utils';
import { ArrowLeft } from 'lucide-react';
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
  actions,
  linkComponent: LinkComponent = 'a',
  className,
}: {
  title: ReactNode;
  back?: PageHeaderBack;
  actions?: ReactNode;
  linkComponent?: ComponentType<PageHeaderLinkProps> | 'a';
  className?: string;
}) {
  return (
    <header data-slot="page-header" className={cn('flex flex-col gap-2', className)}>
      {back ? (
        <LinkComponent
          href={back.href}
          aria-label={back.ariaLabel}
          className="text-ui text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-1.5 self-start rounded-md outline-none focus-visible:ring-2 sm:hidden"
        >
          <ArrowLeft aria-hidden data-slot="page-header-back-icon" className="size-4" />
          {back.label}
        </LinkComponent>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1
            className="text-heading truncate font-semibold"
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
