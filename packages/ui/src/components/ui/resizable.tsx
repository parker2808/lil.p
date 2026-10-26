'use client';

import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export function ResizablePanelGroup({ className, ...props }: ComponentProps<typeof PanelGroup>) {
  return (
    <PanelGroup
      data-slot="resizable-panel-group"
      className={cn('flex h-full w-full', className)}
      {...props}
    />
  );
}

export function ResizablePanel(props: ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />;
}

export function ResizableHandle({ className, ...props }: ComponentProps<typeof PanelResizeHandle>) {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={cn('bg-border w-px', className)}
      {...props}
    />
  );
}
