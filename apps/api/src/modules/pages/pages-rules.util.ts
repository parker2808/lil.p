import { BadRequestException, ConflictException } from '@nestjs/common';
import { BLOCK_REGISTRY, type BlockType, type PageKey } from '@portfolio/contracts';

type RegistryDefinition = (typeof BLOCK_REGISTRY)[BlockType];
type PageBlockLike = { id: number; type: string; sortOrder: number };

export function definitionOf(type: string): RegistryDefinition | undefined {
  return BLOCK_REGISTRY[type as BlockType];
}

export function assertAllowedOnPage(definition: RegistryDefinition, pageKey: PageKey): void {
  if (!definition.pages.includes(pageKey)) {
    throw new BadRequestException({
      code: 'BLOCK_NOT_ALLOWED',
      message: `${definition.type} is not allowed on ${pageKey}`,
    });
  }
}

export function assertWithinLimit(definition: RegistryDefinition, currentCount: number): void {
  if (definition.maxPerPage !== undefined && currentCount >= definition.maxPerPage) {
    throw new ConflictException({
      code: 'BLOCK_LIMIT',
      message: `${definition.type} is limited to ${definition.maxPerPage} per page`,
    });
  }
}

export function assertCanDelete(definition: RegistryDefinition): void {
  if (definition.role === 'h1') {
    throw new ConflictException({
      code: 'BLOCK_LOCKED',
      message: 'The H1 block cannot be deleted',
    });
  }
  if (definition.role === 'required') {
    throw new ConflictException({
      code: 'BLOCK_REQUIRED',
      message: 'A required block cannot be deleted',
    });
  }
}

export function assertCanHide(definition: RegistryDefinition): void {
  if (definition.role === 'h1') {
    throw new ConflictException({
      code: 'BLOCK_LOCKED',
      message: 'The H1 block cannot be hidden',
    });
  }
  if (definition.role === 'required') {
    throw new ConflictException({
      code: 'BLOCK_REQUIRED',
      message: 'A required block cannot be hidden',
    });
  }
}

export function assertLayoutAllowed(definition: RegistryDefinition, layout: string): void {
  if (!definition.layouts.includes(layout as (typeof definition.layouts)[number])) {
    throw new BadRequestException({
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      fieldErrors: { layout: ['Not a layout for this block type'] },
    });
  }
}

export function nextBlockKey(type: string, existing: readonly string[]): string {
  const keys = new Set(existing);
  if (!keys.has(type)) {
    return type;
  }
  let n = 2;
  while (keys.has(`${type}-${n}`)) {
    n += 1;
  }
  return `${type}-${n}`;
}

export function insertSortOrder(
  after: PageBlockLike | undefined,
  blocks: readonly PageBlockLike[],
): number {
  if (after) {
    return after.sortOrder + 1;
  }
  const last = blocks.reduce((max, block) => Math.max(max, block.sortOrder), -1);
  return last + 1;
}

export function assertInsertKeepsH1First(
  targetOrder: number,
  blocks: readonly PageBlockLike[],
): void {
  const h1 = blocks.find((block) => definitionOf(block.type)?.role === 'h1');
  if (h1 && targetOrder <= h1.sortOrder) {
    throw new ConflictException({
      code: 'BLOCK_LOCKED',
      message: 'The H1 block must stay first',
    });
  }
}
