import type { PublicBlock } from '@portfolio/contracts';
import { Band } from '@portfolio/ui/components/Band/Band';
import { BlockLayout } from '@portfolio/ui/components/BlockLayout/BlockLayout';
import { SectionBoundary } from '@portfolio/ui/components/SectionBoundary/SectionBoundary';
import type { ReactNode } from 'react';

import type { BlockRenderers } from '../../constants/block-renderers.constant';
import type { BlockContext } from '../../types/entities/block-context.type';

export function BlockRenderer({
  blocks,
  context,
  labels,
  registry,
}: {
  blocks: PublicBlock[];
  context: BlockContext;
  labels: { error: string; retry: string; empty: string };
  registry: BlockRenderers;
}) {
  const groups: PublicBlock[][] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.surface === 'BAND' && last?.[0]?.surface === 'BAND') {
      last.push(block);
    } else {
      groups.push([block]);
    }
  }

  return (
    <>
      {groups.map((group) => {
        const rendered = group.map((block) => renderBlock(block, context, labels, registry));
        if (group[0]?.surface === 'BAND') {
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

function renderBlock(
  block: PublicBlock,
  context: BlockContext,
  labels: { error: string; retry: string; empty: string },
  registry: BlockRenderers,
): ReactNode {
  const entry = registry[block.type];
  if (!entry) {
    return null;
  }

  const Renderer = entry.component;
  const Fallback = entry.skeleton;

  return (
    <SectionBoundary key={block.id} fallback={<Fallback />} labels={labels}>
      <BlockLayout layout={block.layout} id={block.key}>
        <Renderer block={block} context={context} />
      </BlockLayout>
    </SectionBoundary>
  );
}
