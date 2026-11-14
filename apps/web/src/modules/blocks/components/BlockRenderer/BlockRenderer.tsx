import type { InvalidPreviewBlock, PublicBlock } from '@portfolio/contracts';
import { renderBlocks } from '@parker2808/cms-core/react/server';
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
  resolved,
}: {
  blocks: PublicBlock[];
  invalidBlocks?: InvalidPreviewBlock[];
  draft?: boolean;
  context: BlockContext;
  labels: { error: string; retry: string; empty: string; unknown?: string };
  registry: BlockRenderers;
  resolved?: Record<number, ReactNode>;
}) {
  return (
    <>
      {renderBlocks({
        blocks,
        invalidBlocks,
        draft,
        context,
        labels,
        registry,
        resolved,
        renderComponent: (entry, block, rendererContext) => {
          const Renderer = entry.component;
          return <Renderer block={block} context={rendererContext} />;
        },
        renderSkeleton: (entry) => {
          const Fallback = entry.skeleton;
          return <Fallback />;
        },
        wrapBand: (group, content) => (
          <Band className="public-band" key={group.map((block) => block.id).join('-')}>
            <div className="site-container public-block">{content}</div>
          </Band>
        ),
        wrapBlock: (block, content) => (
          <BlockLayout
            key={block.id}
            layout={block.layout}
            id={block.key}
            data-block-id={block.id}
            data-block-type={block.type}
            className={block.surface === 'PLAIN' ? 'site-container public-block' : undefined}
          >
            {content}
          </BlockLayout>
        ),
        wrapBoundary: (block, content, fallback) => (
          <SectionBoundary key={block.id} fallback={fallback} labels={labels}>
            {content}
          </SectionBoundary>
        ),
        renderUnknown: (block, label, reason) => (
          <UnknownBlockNotice
            key={reason === 'invalid' ? `invalid-${block.id}-${block.key}` : `unknown-${block.id}`}
            block={block}
            labels={{ unknown: label }}
          />
        ),
      })}
    </>
  );
}
