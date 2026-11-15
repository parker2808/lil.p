'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';

export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('bg-muted inline-flex min-h-12 items-center rounded-md p-0.5', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'text-ui inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm px-2.5',
        'data-[state=active]:bg-card data-[state=active]:text-foreground',
        'text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}
