import { cn } from '@portfolio/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

export function Sidebar({
  collapsed = false,
  className,
  ...props
}: ComponentProps<'aside'> & { collapsed?: boolean }) {
  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full flex-col border-r',
        collapsed ? 'w-14' : 'w-60',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex h-12 items-center px-3', className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2', className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('mt-auto border-t px-2 py-2', className)}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="sidebar-group" className={cn('flex flex-col gap-1', className)} {...props} />
  );
}

export function SidebarGroupLabel({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="sidebar-group-label"
      className={cn('text-ui-meta text-muted-foreground px-2 py-1 font-medium', className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul data-slot="sidebar-menu" className={cn('flex flex-col gap-0.5', className)} {...props} />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-item" className={cn('min-w-0', className)} {...props} />;
}

export function SidebarMenuButton({
  className,
  active = false,
  asChild = false,
  ...props
}: ComponentProps<'a'> & { active?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={active ? 'true' : 'false'}
      className={cn(
        'text-ui flex h-8 items-center gap-2 rounded-md px-2',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary border-l-2'
          : 'hover:bg-sidebar-accent/80',
        className,
      )}
      {...props}
    />
  );
}
