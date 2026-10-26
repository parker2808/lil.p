'use client';

import type { AdminBlock, BlockType } from '@portfolio/contracts';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import {
  SortableList,
  type SortableListLabels,
} from '@portfolio/ui/components/SortableList/SortableList';

import { BlockRow } from '../BlockRow/BlockRow';

export function BlockList({
  blocks,
  selectedId,
  readOnly,
  labels,
  onSelect,
  onToggle,
  onMove,
  onDuplicate,
  onDelete,
  onReorder,
}: {
  blocks: AdminBlock[];
  selectedId: number | null;
  readOnly: boolean;
  labels: SortableListLabels & {
    menu: string;
    moveUp: string;
    moveDown: string;
    duplicate: string;
    delete: string;
    visible: string;
    unknown: string;
  };
  onSelect: (id: number) => void;
  onToggle: (block: AdminBlock, isVisible: boolean) => void;
  onMove: (block: AdminBlock, direction: -1 | 1) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onReorder: (ids: number[]) => void;
}) {
  const items = blocks.map((block) => ({
    id: String(block.id),
    disabled: BLOCK_REGISTRY[block.type as BlockType]?.role === 'h1',
    block,
  }));

  return (
    <SortableList
      items={items}
      disabled={readOnly}
      labels={labels}
      onReorder={(ids) => onReorder(ids.map(Number))}
      overlay={(item) => item.block.key}
    >
      {(item, handle) => (
        <BlockRow
          block={item.block}
          selected={item.block.id === selectedId}
          readOnly={readOnly}
          handle={handle}
          labels={labels}
          onSelect={() => onSelect(item.block.id)}
          onToggle={(isVisible) => onToggle(item.block, isVisible)}
          onMove={(direction) => onMove(item.block, direction)}
          onDuplicate={() => onDuplicate(item.block.id)}
          onDelete={() => onDelete(item.block.id)}
        />
      )}
    </SortableList>
  );
}
