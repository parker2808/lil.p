import { cn } from '@portfolio/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

export function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      data-slot="pagination"
      className={cn('flex items-center justify-center gap-2', className)}
      {...props}
    />
  );
}

export function PaginationList({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-list"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}

export function PaginationItem(props: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  asChild = false,
  ...props
}: ComponentProps<'a'> & { isActive?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-slot="pagination-link"
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'text-ui inline-flex min-h-8 min-w-8 items-center justify-center rounded-md px-2',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}
