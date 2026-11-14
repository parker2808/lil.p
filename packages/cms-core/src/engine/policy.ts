import { type BlockDefinition, isBlockAllowedOnPage, type PageKey } from '../contracts';

export type PolicyFinding =
  | { code: 'BLOCK_NOT_ALLOWED'; type: string; pageKey: PageKey }
  | { code: 'BLOCK_LIMIT'; type: string; limit: number }
  | { code: 'BLOCK_LOCKED'; action: 'delete' | 'hide' | 'insert' }
  | { code: 'BLOCK_REQUIRED'; action: 'delete' | 'hide' }
  | { code: 'VALIDATION_FAILED'; field: 'layout' };

export type BlockRegistry = Readonly<Record<string, BlockDefinition | undefined>>;

export function findBlock(registry: BlockRegistry, type: string): BlockDefinition | undefined {
  return Object.hasOwn(registry, type) ? registry[type] : undefined;
}

export function checkPageAllowance(
  definition: BlockDefinition,
  pageKey: PageKey,
  builtInPageKeys: readonly PageKey[],
): PolicyFinding | undefined {
  if (!isBlockAllowedOnPage(definition, pageKey, builtInPageKeys)) {
    return { code: 'BLOCK_NOT_ALLOWED', type: definition.type, pageKey };
  }
}

export function checkBlockLimit(
  definition: BlockDefinition,
  currentCount: number,
): PolicyFinding | undefined {
  if (definition.maxPerPage !== undefined && currentCount >= definition.maxPerPage) {
    return { code: 'BLOCK_LIMIT', type: definition.type, limit: definition.maxPerPage };
  }
}

export function checkBlockRole(
  definition: BlockDefinition,
  action: 'delete' | 'hide',
): PolicyFinding | undefined {
  if (definition.role === 'h1') return { code: 'BLOCK_LOCKED', action };
  if (definition.role === 'required') return { code: 'BLOCK_REQUIRED', action };
}

export function checkBlockLayout(
  definition: BlockDefinition,
  layout: string,
): PolicyFinding | undefined {
  if (!definition.layouts.some((allowed) => allowed === layout)) {
    return { code: 'VALIDATION_FAILED', field: 'layout' };
  }
}

export function checkH1Insert(
  registry: BlockRegistry,
  targetOrder: number,
  blocks: readonly { type: string; sortOrder: number }[],
): PolicyFinding | undefined {
  const heading = blocks.find((block) => findBlock(registry, block.type)?.role === 'h1');
  if (heading && targetOrder <= heading.sortOrder) {
    return { code: 'BLOCK_LOCKED', action: 'insert' };
  }
}
