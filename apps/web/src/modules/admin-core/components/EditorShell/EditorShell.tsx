'use client';

import { LocaleTabs } from '@portfolio/ui/components/LocaleTabs/LocaleTabs';
import { PropertyList } from '@portfolio/ui/components/PropertyList/PropertyList';
import { SaveStatus, type SaveStatusState } from '@portfolio/ui/components/SaveStatus/SaveStatus';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@portfolio/ui/components/ui/drawer';
import type { ReactNode } from 'react';

import { useIsAdmin } from '../../hooks/use-me.hook';

export function EditorShell({
  title,
  saveStatus,
  savedText,
  onLoadLatest,
  onOverwrite,
  publish,
  properties,
  preview,
  locale,
  onLocaleChange,
  completeness,
  labels,
  children,
}: {
  title: ReactNode;
  saveStatus: SaveStatusState;
  savedText?: string;
  onLoadLatest?: () => void;
  onOverwrite?: () => void;
  publish?: ReactNode;
  properties: ReactNode;
  preview?: ReactNode;
  locale: 'en' | 'vi';
  onLocaleChange: (locale: 'en' | 'vi') => void;
  completeness: { en: boolean; vi: boolean };
  labels: {
    readOnly: string;
    properties: string;
    saving: string;
    saved: string;
    offline: string;
    conflict: string;
    loadLatest: string;
    overwrite: string;
    localeEn: string;
    localeVi: string;
  };
  children: ReactNode;
}) {
  const readOnly = !useIsAdmin();

  return (
    <div data-slot="editor-shell" className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-heading truncate font-semibold">{title}</h1>
        </div>
        {readOnly ? <Badge variant="warning">{labels.readOnly}</Badge> : null}
        <SaveStatus
          state={readOnly ? 'idle' : saveStatus}
          savedText={savedText}
          labels={labels}
          onLoadLatest={onLoadLatest}
          onOverwrite={onOverwrite}
        />
        {publish}
      </header>
      <div className="flex items-center justify-between gap-3">
        <LocaleTabs
          value={locale}
          onChange={onLocaleChange}
          completeness={completeness}
          labels={{ en: labels.localeEn, vi: labels.localeVi }}
          disabled={readOnly}
        />
        <Drawer>
          <DrawerTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="lg:hidden">
              {labels.properties}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>{labels.properties}</DrawerTitle>
            <PropertyList className="mt-4 overflow-y-auto">{properties}</PropertyList>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_20rem_minmax(16rem,20rem)]">
        <div className="min-w-0">{children}</div>
        <aside className="hidden lg:block">
          <PropertyList>{properties}</PropertyList>
        </aside>
        {preview ? <aside className="hidden 2xl:block">{preview}</aside> : null}
      </div>
    </div>
  );
}
