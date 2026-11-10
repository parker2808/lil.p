export type OrderedBlock = { sortOrder: number };

export function orderBlocks<Block extends OrderedBlock>(blocks: readonly Block[]): Block[] {
  return blocks
    .map((block, index) => ({ block, index }))
    .sort((left, right) => left.block.sortOrder - right.block.sortOrder || left.index - right.index)
    .map(({ block }) => block);
}

export function nextBlockKey(type: string, existing: readonly string[]): string {
  const keys = new Set(existing);
  if (!keys.has(type)) return type;
  let suffix = 2;
  while (keys.has(`${type}-${suffix}`)) suffix += 1;
  return `${type}-${suffix}`;
}

export function insertSortOrder(
  after: OrderedBlock | undefined,
  blocks: readonly OrderedBlock[],
): number {
  if (after) return after.sortOrder + 1;
  return blocks.reduce((highest, block) => Math.max(highest, block.sortOrder), -1) + 1;
}
