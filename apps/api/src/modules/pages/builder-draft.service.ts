import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { readTree } from '@parker2808/cms-core/tree';
import { corePageKeySchema, toPrismaPageKey } from '@portfolio/contracts';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { BuilderDraftInput } from './dto/builder-draft.dto';
import { parsePageKey } from './pages-rules.util';

const MAX_REVISION = 9223372036854775807n;

export function treeValidationError(code: string, nodeId?: string): BadRequestException {
  return new BadRequestException({
    code: 'VALIDATION_FAILED',
    message: 'Validation failed',
    fieldErrors: { tree: [nodeId ? `${code} at ${nodeId}` : code] },
  });
}

export function storedTreeError(): BadRequestException {
  return new BadRequestException({
    code: 'INVALID_BLOCKS',
    message: 'This version snapshot could not be read',
    fieldErrors: { snapshot: ['Invalid snapshot'] },
  });
}

@Injectable()
export class BuilderDraftService {
  constructor(private readonly prisma: PrismaService) {}

  async get(rawKey: string) {
    const page = await this.requirePage(rawKey);
    return this.toDraft(page);
  }

  async activate(rawKey: string, input: BuilderDraftInput) {
    return this.write(rawKey, input, 'legacy');
  }

  async save(rawKey: string, input: BuilderDraftInput) {
    return this.write(rawKey, input, 'tree');
  }

  private async write(rawKey: string, input: BuilderDraftInput, mode: 'legacy' | 'tree') {
    const key = parsePageKey(rawKey);
    const page = await this.requirePage(rawKey);
    if (corePageKeySchema.safeParse(key).success) throw this.conflict(page);
    this.assertRevision(page, input.expectedRevision, mode);
    if (mode === 'tree') this.toDraft(page);
    const parsed = readTree(input.tree);
    if (!parsed.ok) throw treeValidationError(parsed.code, parsed.nodeId);
    if (page.draftTreeRevision === MAX_REVISION) throw this.conflict(page);
    const changed = await this.prisma.page.updateMany({
      where: {
        id: page.id,
        draftTreeRevision: page.draftTreeRevision,
        draftTree: mode === 'legacy' ? { equals: Prisma.DbNull } : { not: Prisma.DbNull },
      },
      data: {
        draftTree: parsed.value as Prisma.InputJsonValue,
        draftTreeRevision: { increment: 1 },
      },
    });
    if (changed.count !== 1) throw this.conflict(await this.requirePage(rawKey));
    return {
      mode: 'tree' as const,
      revision: (page.draftTreeRevision + 1n).toString(),
      tree: parsed.value,
    };
  }

  private assertRevision(
    page: Awaited<ReturnType<BuilderDraftService['requirePage']>>,
    expectedRevision: string,
    mode: 'legacy' | 'tree',
  ) {
    if (
      page.draftTreeRevision.toString() !== expectedRevision ||
      (page.draftTree === null ? 'legacy' : 'tree') !== mode
    )
      throw this.conflict(page);
  }

  private conflict(page: Awaited<ReturnType<BuilderDraftService['requirePage']>>) {
    return new ConflictException({
      code: 'CONFLICT',
      message: 'Builder draft changed; reload before editing',
      mode: page.draftTree === null ? 'legacy' : 'tree',
      revision: page.draftTreeRevision.toString(),
    });
  }

  private toDraft(page: Awaited<ReturnType<BuilderDraftService['requirePage']>>) {
    if (page.draftTree === null)
      return { mode: 'legacy' as const, revision: page.draftTreeRevision.toString(), tree: null };
    const parsed = readTree(page.draftTree);
    if (!parsed.ok) throw storedTreeError();
    return {
      mode: 'tree' as const,
      revision: page.draftTreeRevision.toString(),
      tree: parsed.value,
    };
  }

  private async requirePage(rawKey: string) {
    const key = parsePageKey(rawKey);
    const page = await this.prisma.page.findUnique({ where: { key: toPrismaPageKey(key) } });
    if (!page)
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${key} was not found` });
    return page;
  }
}
