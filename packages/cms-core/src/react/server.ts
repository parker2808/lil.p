import type { InvalidPreviewBlock, PublicBlock } from '../contracts';
export type { TreeRenderOptions, TreeRenderResult } from './tree-renderer/render';
export { renderTree } from './tree-renderer/render';

export type ServerRendererProps<Block extends PublicBlock, Context, Node, Entry> = {
  blocks: Block[];
  invalidBlocks?: InvalidPreviewBlock[];
  draft?: boolean;
  context: Context;
  labels: { error: string; retry: string; empty: string; unknown?: string };
  registry: Readonly<Record<string, Entry | undefined>>;
  resolved?: Record<number, Node>;
  renderComponent: (entry: Entry, block: Block, context: Context) => Node;
  renderSkeleton: (entry: Entry) => Node;
  wrapBlock: (block: Block, content: Node) => Node;
  wrapBand: (blocks: Array<Block | InvalidPreviewBlock>, content: Array<Node | null>) => Node;
  wrapBoundary: (block: Block, content: Node, fallback: Node) => Node;
  renderUnknown: (block: InvalidPreviewBlock, label: string, reason: 'invalid' | 'unknown') => Node;
};

export function renderBlocks<Block extends PublicBlock, Context, Node, Entry>({
  blocks,
  invalidBlocks = [],
  draft = false,
  context,
  labels,
  registry,
  resolved,
  renderComponent,
  renderSkeleton,
  wrapBlock,
  wrapBand,
  wrapBoundary,
  renderUnknown,
}: ServerRendererProps<Block, Context, Node, Entry>): Array<Node | Array<Node | null>> {
  const groups: Array<Array<Block | InvalidPreviewBlock>> = [];
  const queue: Array<Block | InvalidPreviewBlock> = [...blocks];
  if (draft) queue.push(...invalidBlocks);

  for (const block of queue) {
    if (resolved && block.id in resolved && resolved[block.id] === null) continue;
    const last = groups.at(-1);
    if (
      'surface' in block &&
      block.surface === 'BAND' &&
      last?.[0] &&
      'surface' in last[0] &&
      last[0].surface === 'BAND'
    ) {
      last.push(block);
    } else {
      groups.push([block]);
    }
  }

  return groups.map((group) => {
    const rendered = group.map((block) => {
      if (!('layout' in block))
        return renderUnknown(block, labels.unknown ?? block.type, 'invalid');

      const entry = registry[block.type];
      if (!entry) {
        return draft
          ? renderUnknown(
              { id: block.id, type: block.type, key: block.key, issues: [] },
              labels.unknown ?? block.type,
              'unknown',
            )
          : null;
      }
      const content = wrapBlock(
        block,
        resolved && block.id in resolved
          ? resolved[block.id]!
          : renderComponent(entry, block, context),
      );
      return resolved ? content : wrapBoundary(block, content, renderSkeleton(entry));
    });
    return group[0] && 'surface' in group[0] && group[0].surface === 'BAND'
      ? wrapBand(group, rendered)
      : rendered;
  });
}
