import { cn } from '@portfolio/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

export function Breadcrumb(props: ComponentProps<'nav'>) {
  return <nav data-slot="breadcrumb" {...props} />;
}

export function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn('text-meta text-muted-foreground flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center', className)}
      {...props}
    />
  );
}

export function BreadcrumbLink({
  className,
  asChild = false,
  ...props
}: ComponentProps<'a'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('hover:text-foreground', className)}
      {...props}
    />
  );
}
