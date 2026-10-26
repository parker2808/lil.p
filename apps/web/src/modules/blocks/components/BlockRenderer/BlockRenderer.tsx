import type { InvalidPreviewBlock, PublicBlock } from '@portfolio/contracts';
import { Band } from '@portfolio/ui/components/Band/Band';
import { BlockLayout } from '@portfolio/ui/components/BlockLayout/BlockLayout';
import { SectionBoundary } from '@portfolio/ui/components/SectionBoundary/SectionBoundary';
import type { ReactNode } from 'react';

import type { BlockRenderers } from '../../constants/block-renderers.constant';
import type { BlockContext } from '../../types/entities/block-context.type';
import { UnknownBlockNotice } from '../UnknownBlockNotice/UnknownBlockNotice';

export function BlockRenderer({
  blocks,
  invalidBlocks = [],
  draft = false,
  context,
  labels,
  registry,
}: {
  blocks: PublicBlock[];
  invalidBlocks?: InvalidPreviewBlock[];
  draft?: boolean;
  context: BlockContext;
  labels: { error: string; retry: string; empty: string; unknown?: string };
  registry: BlockRenderers;
}) {
  const groups: Array<PublicBlock | InvalidPreviewBlock>[] = [];
  const queue: Array<PublicBlock | InvalidPreviewBlock> = [...blocks];
  if (draft) {
    queue.push(...invalidBlocks);
  }

  for (const block of queue) {
    const last = groups.at(-1);
    const surface = 'surface' in block ? block.surface : 'PLAIN';
    if (surface === 'BAND' && last?.[0] && 'surface' in last[0] && last[0].surface === 'BAND') {
      last.push(block);
    } else {
      groups.push([block]);
    }
  }

  return (
    <>
      {groups.map((group) => {
        const rendered = group.map((block) => renderEntry(block, context, labels, registry, draft));
        if (group[0] && 'surface' in group[0] && group[0].surface === 'BAND') {
          return (
            <Band key={group.map((block) => block.id).join('-')}>
              <div className="mx-auto max-w-5xl px-6 py-16">{rendered}</div>
            </Band>
          );
        }
        return rendered;
      })}
    </>
  );
}

function renderEntry(
  block: PublicBlock | InvalidPreviewBlock,
  context: BlockContext,
  labels: { error: string; retry: string; empty: string; unknown?: string },
  registry: BlockRenderers,
  draft: boolean,
): ReactNode {
  if (!('layout' in block)) {
    if (!draft) {
      return null;
    }
    return (
      <UnknownBlockNotice
        key={`invalid-${block.id}-${block.key}`}
        block={block}
        labels={{ unknown: labels.unknown ?? block.type }}
      />
    );
  }

  const entry = registry[block.type];
  if (!entry) {
    if (!draft) {
      return null;
    }
    return (
      <UnknownBlockNotice
        key={`unknown-${block.id}`}
        block={{ id: block.id, type: block.type, key: block.key, issues: [] }}
        labels={{ unknown: labels.unknown ?? block.type }}
      />
    );
  }

  const Renderer = entry.component;
  const Fallback = entry.skeleton;

  return (
    <SectionBoundary key={block.id} fallback={<Fallback />} labels={labels}>
      <BlockLayout
        layout={block.layout}
        id={block.key}
        data-block-id={block.id}
        className={block.surface === 'PLAIN' ? 'mx-auto max-w-5xl px-6 py-16' : undefined}
      >
        <Renderer block={block} context={context} />
      </BlockLayout>
    </SectionBoundary>
  );
}
