import { cn } from '@portfolio/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

export function NavLink({
  asChild = false,
  active = false,
  className,
  ...props
}: ComponentProps<'a'> & { asChild?: boolean; active?: boolean }) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="nav-link"
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-ui inline-flex h-8 items-center px-2 transition-colors',
        active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
