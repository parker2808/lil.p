'use client';

import { BLOCK_REGISTRY, type BlockType, type PageKey } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@portfolio/ui/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@portfolio/ui/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { BLOCK_EDITOR_META } from '../../constants/block-editor-meta.constant';

export function AddBlockDialog({
  pageKey,
  counts,
  readOnly,
  onAdd,
}: {
  pageKey: PageKey;
  counts: Record<string, number>;
  readOnly: boolean;
  onAdd: (type: BlockType) => void;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const types = (Object.keys(BLOCK_REGISTRY) as BlockType[]).filter((type) =>
    BLOCK_REGISTRY[type].pages.includes(pageKey),
  );

  if (readOnly) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          {t('admin.pages.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{t('admin.pages.add')}</DialogTitle>
        <Command>
          <CommandInput placeholder={t('admin.pages.searchTypes')} />
          <CommandList>
            <CommandEmpty>{t('admin.pages.emptyTypes')}</CommandEmpty>
            {types.map((type) => {
              const definition = BLOCK_REGISTRY[type];
              const meta = BLOCK_EDITOR_META[type];
              const atLimit =
                definition.maxPerPage !== undefined && (counts[type] ?? 0) >= definition.maxPerPage;
              return (
                <CommandItem
                  key={type}
                  disabled={atLimit}
                  value={`${type} ${t(meta.labelKey)}`}
                  onSelect={() => {
                    if (atLimit) {
                      return;
                    }
                    onAdd(type);
                    setOpen(false);
                  }}
                >
                  <Icon name={meta.icon} className="mr-2 size-4" />
                  <span className="flex-1">{t(meta.labelKey)}</span>
                  <span className="text-ui-meta text-muted-foreground">
                    {t(meta.descriptionKey)}
                  </span>
                  {atLimit ? (
                    <span className="text-ui-meta text-muted-foreground">
                      {t('admin.pages.atLimit')}
                    </span>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
