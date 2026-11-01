'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@portfolio/ui/components/ui/tabs';
import { cn } from '@portfolio/ui/lib/utils';
import { createContext, type ReactNode, useContext, useState } from 'react';

import type { MarkdownEditorGroupMode, MarkdownEditorLabels } from './types';

const MarkdownEditorGroupContext = createContext<MarkdownEditorGroupMode | null>(null);

export function useMarkdownEditorGroupMode() {
  return useContext(MarkdownEditorGroupContext);
}

export function MarkdownEditorGroup({
  labels,
  className,
  children,
}: {
  labels: Pick<MarkdownEditorLabels, 'write' | 'preview'>;
  className?: string;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<MarkdownEditorGroupMode>('write');

  return (
    <Tabs
      value={mode}
      onValueChange={(next) => setMode(next as MarkdownEditorGroupMode)}
      className="flex flex-col gap-3"
    >
      <TabsList className="self-start">
        <TabsTrigger value="write">{labels.write}</TabsTrigger>
        <TabsTrigger value="preview">{labels.preview}</TabsTrigger>
      </TabsList>
      {/* One panel keyed to the active mode, so switching keeps every editor mounted. */}
      <TabsContent value={mode} className={cn('flex flex-col gap-6', className)}>
        <MarkdownEditorGroupContext.Provider value={mode}>
          {children}
        </MarkdownEditorGroupContext.Provider>
      </TabsContent>
    </Tabs>
  );
}
