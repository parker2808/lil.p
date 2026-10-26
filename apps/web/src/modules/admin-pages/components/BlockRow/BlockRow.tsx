'use client';

import type { AdminBlock, BlockType, IconKey } from '@portfolio/contracts';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { Alert } from '@portfolio/ui/components/ui/alert';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';
import { Switch } from '@portfolio/ui/components/ui/switch';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

import { BLOCK_EDITOR_META } from '../../constants/block-editor-meta.constant';

export function BlockRow({
  block,
  selected,
  highlighted = false,
  readOnly,
  handle,
  labels,
  onSelect,
  onToggle,
  onMove,
  onDuplicate,
  onDelete,
}: {
  block: AdminBlock;
  selected: boolean;
  highlighted?: boolean;
  readOnly: boolean;
  handle: ReactNode;
  labels: {
    menu: string;
    moveUp: string;
    moveDown: string;
    duplicate: string;
    delete: string;
    visible: string;
    unknown: string;
  };
  onSelect: () => void;
  onToggle: (isVisible: boolean) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const definition = BLOCK_REGISTRY[block.type as BlockType];
  const meta = BLOCK_EDITOR_META[block.type as BlockType];
  const locked = definition?.role === 'h1';
  const invalid = !definition || (block.issues && block.issues.length > 0);

  if (invalid) {
    return (
      <Alert variant="destructive" className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{meta?.labelKey ? block.type : labels.unknown}</p>
          <p className="text-ui-meta font-mono">{block.key}</p>
          {block.issues?.map((issue) => (
            <p key={issue}>{issue}</p>
          ))}
        </div>
        {readOnly ? null : (
          <Button type="button" size="sm" variant="ghost" onClick={onDelete}>
            {labels.delete}
          </Button>
        )}
      </Alert>
    );
  }

  return (
    <div
      className={
        highlighted
          ? 'border-destructive bg-card flex items-center gap-2 rounded-md border p-2'
          : selected
            ? 'border-border bg-sidebar-accent flex items-center gap-2 rounded-md border p-2'
            : 'border-border bg-card flex items-center gap-2 rounded-md border p-2'
      }
    >
      {handle}
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        onClick={onSelect}
      >
        <Icon name={(meta?.icon ?? 'circle-dot') as IconKey} className="size-4 shrink-0" />
        <span className="text-ui min-w-0 truncate font-medium">{block.type}</span>
        <span className="text-ui-meta text-muted-foreground font-mono">{block.key}</span>
        <Badge variant="outline">{block.layout}</Badge>
      </button>
      <Switch
        checked={block.isVisible}
        disabled={readOnly || locked}
        aria-label={labels.visible}
        onCheckedChange={(checked) => onToggle(checked)}
      />
      {readOnly ? null : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm" variant="ghost" aria-label={labels.menu}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={locked} onSelect={() => onMove(-1)}>
              {labels.moveUp}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={locked} onSelect={() => onMove(1)}>
              {labels.moveDown}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>{labels.duplicate}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" disabled={locked} onSelect={onDelete}>
              {labels.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
