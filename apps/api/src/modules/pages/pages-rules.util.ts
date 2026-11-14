import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import {
  checkBlockLayout,
  checkBlockLimit,
  checkBlockRole,
  checkH1Insert,
  checkPageAllowance,
  findBlock,
} from '@parker2808/cms-core/engine';
import {
  BLOCK_REGISTRY,
  type BlockType,
  corePageKeySchema,
  type PageKey,
  pageKeySchema,
} from '@portfolio/contracts';

type RegistryDefinition = (typeof BLOCK_REGISTRY)[BlockType];
type PageBlockLike = { id: number; type: string; sortOrder: number };

export function definitionOf(type: string): RegistryDefinition | undefined {
  return findBlock(BLOCK_REGISTRY, type) as RegistryDefinition | undefined;
}

export function parsePageKey(raw: string): PageKey {
  const parsed = pageKeySchema.safeParse(raw);
  if (!parsed.success) {
    throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${raw} was not found` });
  }
  return parsed.data;
}

export function assertAllowedOnPage(definition: RegistryDefinition, pageKey: PageKey): void {
  if (checkPageAllowance(definition, pageKey, corePageKeySchema.options)) {
    throw new BadRequestException({
      code: 'BLOCK_NOT_ALLOWED',
      message: `${definition.type} is not allowed on ${pageKey}`,
    });
  }
}

export function assertWithinLimit(definition: RegistryDefinition, currentCount: number): void {
  const finding = checkBlockLimit(definition, currentCount);
  if (finding?.code === 'BLOCK_LIMIT') {
    throw new ConflictException({
      code: 'BLOCK_LIMIT',
      message: `${definition.type} is limited to ${finding.limit} per page`,
    });
  }
}

export function assertCanDelete(definition: RegistryDefinition): void {
  const finding = checkBlockRole(definition, 'delete');
  if (finding?.code === 'BLOCK_LOCKED') {
    throw new ConflictException({
      code: 'BLOCK_LOCKED',
      message: 'The H1 block cannot be deleted',
    });
  }
  if (finding?.code === 'BLOCK_REQUIRED') {
    throw new ConflictException({
      code: 'BLOCK_REQUIRED',
      message: 'A required block cannot be deleted',
    });
  }
}

export function assertCanHide(definition: RegistryDefinition): void {
  const finding = checkBlockRole(definition, 'hide');
  if (finding?.code === 'BLOCK_LOCKED') {
    throw new ConflictException({
      code: 'BLOCK_LOCKED',
      message: 'The H1 block cannot be hidden',
    });
  }
  if (finding?.code === 'BLOCK_REQUIRED') {
    throw new ConflictException({
      code: 'BLOCK_REQUIRED',
      message: 'A required block cannot be hidden',
    });
  }
}

export function assertLayoutAllowed(definition: RegistryDefinition, layout: string): void {
  if (checkBlockLayout(definition, layout)) {
    throw new BadRequestException({
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      fieldErrors: { layout: ['Not a layout for this block type'] },
    });
  }
}

export { insertSortOrder, nextBlockKey } from '@parker2808/cms-core/engine';

export function assertInsertKeepsH1First(
  targetOrder: number,
  blocks: readonly PageBlockLike[],
): void {
  if (checkH1Insert(BLOCK_REGISTRY, targetOrder, blocks)) {
    throw new ConflictException({
      code: 'BLOCK_LOCKED',
      message: 'The H1 block must stay first',
    });
  }
}
