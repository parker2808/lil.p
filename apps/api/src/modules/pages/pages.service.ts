import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  type AdminBlock,
  type AdminPage,
  type AdminPageListItem,
  type BlockCreateInput,
  type BlockUpdateInput,
  type Locale,
  PAGE_KEY_TO_PRISMA,
  type PageKey,
  pageKeySchema,
  type PageUpdateInput,
  type PublicPage,
} from '@portfolio/contracts';
import type { z } from 'zod';

import { flattenZodError } from '../../common/pipes/zod-validation.pipe';
import { applyReorder } from '../../common/utils/reorder.util';
import { assertFresh } from '../../common/utils/stale.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { pageWithAllBlocksInclude, pageWithBlocksInclude } from './entities/page.entity';
import {
  toAdminBlock,
  toAdminPage,
  toAdminPageListItem,
  toPublicPage,
} from './entities/page.mapper';
import {
  assertAllowedOnPage,
  assertCanDelete,
  assertCanHide,
  assertInsertKeepsH1First,
  assertLayoutAllowed,
  assertWithinLimit,
  definitionOf,
  insertSortOrder,
  nextBlockKey,
} from './pages-rules.util';

type Tx = Prisma.TransactionClient;

const PAGE_ORDER: PageKey[] = ['home', 'about', 'projects', 'notes', 'contact'];

function parsePageKey(raw: string): PageKey {
  const parsed = pageKeySchema.safeParse(raw);
  if (!parsed.success) {
    throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${raw} was not found` });
  }
  return parsed.data;
}

function propsFieldErrors(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(flattenZodError(error)).map(([path, messages]) => [
      path === 'root' ? 'props' : `props.${path}`,
      messages,
    ]),
  );
}

function findRefPath(value: unknown, id: number, prefix: string): string | null {
  if (value === id) {
    return prefix;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findRefPath(value[index], id, `${prefix}.${index}`);
      if (found) {
        return found;
      }
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      const found = findRefPath(item, id, prefix ? `${prefix}.${key}` : key);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPublic(key: PageKey, locale: Locale, requestId = 'unknown'): Promise<PublicPage> {
    const row = await this.prisma.page.findUnique({
      where: { key: PAGE_KEY_TO_PRISMA[key] },
      include: pageWithBlocksInclude,
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${key} was not found` });
    }

    return toPublicPage(row, locale, ({ blockId, type, reason }) => {
      this.logger.warn(
        `Dropped block ${blockId} type=${type} page=${key} reason=${reason} ${requestId}`,
      );
    });
  }

  async listAdmin(): Promise<AdminPageListItem[]> {
    const rows = await this.prisma.page.findMany({
      include: { _count: { select: { blocks: true } } },
    });
    const rank = new Map(PAGE_ORDER.map((key, index) => [key, index]));
    return rows
      .map(toAdminPageListItem)
      .sort((a, b) => (rank.get(a.key) ?? 99) - (rank.get(b.key) ?? 99));
  }

  async getAdmin(rawKey: string): Promise<AdminPage> {
    return toAdminPage(await this.requirePage(this.prisma, parsePageKey(rawKey)));
  }

  async reorderBlocks(rawKey: string, ids: number[]): Promise<AdminPage> {
    const key = parsePageKey(rawKey);
    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      const h1 = page.blocks.find((block) => definitionOf(block.type)?.role === 'h1');
      if (h1 && ids[0] !== h1.id) {
        throw new ConflictException({
          code: 'BLOCK_LOCKED',
          message: 'The H1 block must stay first',
        });
      }
      await applyReorder(tx.pageBlock, ids, { pageId: page.id });
      await this.touchPage(tx, page.id);
      return toAdminPage(await this.requirePage(tx, key));
    });
  }

  async updatePage(rawKey: string, input: PageUpdateInput): Promise<AdminPage> {
    const key = parsePageKey(rawKey);
    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      assertFresh(page.updatedAt, input.updatedAt);
      await tx.page.update({
        where: { id: page.id },
        data: {
          seoTitleEn: input.seoTitleEn,
          seoTitleVi: input.seoTitleVi,
          seoDescriptionEn: input.seoDescriptionEn,
          seoDescriptionVi: input.seoDescriptionVi,
          updatedAt: new Date(),
        },
      });
      return toAdminPage(await this.requirePage(tx, key));
    });
  }

  async createBlock(rawKey: string, input: BlockCreateInput): Promise<AdminBlock> {
    const key = parsePageKey(rawKey);
    const definition = definitionOf(input.type);
    if (!definition) {
      throw new BadRequestException({
        code: 'BLOCK_NOT_ALLOWED',
        message: `Unknown block type ${input.type}`,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      assertAllowedOnPage(definition, key);
      const count = page.blocks.filter((block) => block.type === definition.type).length;
      assertWithinLimit(definition, count);

      const after = input.afterId ? this.requireBlock(page, input.afterId) : undefined;
      const sortOrder = insertSortOrder(after, page.blocks);
      assertInsertKeepsH1First(sortOrder, page.blocks);

      const keyName = nextBlockKey(
        definition.type,
        page.blocks.map((block) => block.key),
      );
      const layout = definition.layouts[0];
      if (!layout) {
        throw new BadRequestException({
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          fieldErrors: { layout: ['This block type has no layouts'] },
        });
      }

      await tx.pageBlock.updateMany({
        where: { pageId: page.id, sortOrder: { gte: sortOrder } },
        data: { sortOrder: { increment: 1 } },
      });
      const created = await tx.pageBlock.create({
        data: {
          pageId: page.id,
          type: definition.type,
          key: keyName,
          schemaVersion: definition.version,
          props: definition.defaults as Prisma.InputJsonValue,
          layout,
          surface: 'PLAIN',
          sortOrder,
          isVisible: true,
        },
      });
      await this.touchPage(tx, page.id);
      return toAdminBlock(created);
    });
  }

  async updateBlock(rawKey: string, id: number, input: BlockUpdateInput): Promise<AdminBlock> {
    const key = parsePageKey(rawKey);
    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      const current = this.requireBlock(page, id);
      assertFresh(current.updatedAt, input.updatedAt);

      const definition = definitionOf(current.type);
      if (input.isVisible === false && definition) {
        assertCanHide(definition);
      }
      if (input.layout) {
        if (!definition) {
          throw new BadRequestException({
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            fieldErrors: { layout: ['Unknown block type'] },
          });
        }
        assertLayoutAllowed(definition, input.layout);
      }

      const data: Prisma.PageBlockUncheckedUpdateInput = {};
      if (input.layout) {
        data.layout = input.layout;
      }
      if (input.surface) {
        data.surface = input.surface;
      }
      if (input.isVisible !== undefined) {
        data.isVisible = input.isVisible;
      }
      if (input.key !== undefined) {
        data.key = input.key;
      }
      if (input.props !== undefined) {
        if (!definition) {
          throw new BadRequestException({
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            fieldErrors: { props: ['Unknown block type'] },
          });
        }
        const parsed = definition.props.safeParse(input.props);
        if (!parsed.success) {
          throw new BadRequestException({
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            fieldErrors: propsFieldErrors(parsed.error),
          });
        }
        await this.assertRefsExist(tx, definition, parsed.data);
        data.props = parsed.data as Prisma.InputJsonValue;
      }

      const updated = await tx.pageBlock.update({
        where: { id: current.id },
        data,
      });
      await this.touchPage(tx, page.id);
      return toAdminBlock(updated);
    });
  }

  async duplicateBlock(rawKey: string, id: number): Promise<AdminBlock> {
    const key = parsePageKey(rawKey);
    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      const current = this.requireBlock(page, id);
      const sortOrder = current.sortOrder + 1;
      assertInsertKeepsH1First(sortOrder, page.blocks);

      const keyName = nextBlockKey(
        current.type,
        page.blocks.map((block) => block.key),
      );
      await tx.pageBlock.updateMany({
        where: { pageId: page.id, sortOrder: { gte: sortOrder } },
        data: { sortOrder: { increment: 1 } },
      });
      const created = await tx.pageBlock.create({
        data: {
          pageId: page.id,
          type: current.type,
          key: keyName,
          schemaVersion: current.schemaVersion,
          props: current.props as Prisma.InputJsonValue,
          layout: current.layout,
          surface: current.surface,
          sortOrder,
          isVisible: current.isVisible,
        },
      });
      await this.touchPage(tx, page.id);
      return toAdminBlock(created);
    });
  }

  async deleteBlock(rawKey: string, id: number): Promise<AdminBlock> {
    const key = parsePageKey(rawKey);
    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      const current = this.requireBlock(page, id);
      const definition = definitionOf(current.type);
      if (definition) {
        assertCanDelete(definition);
      }
      await tx.pageBlock.delete({ where: { id: current.id } });
      await this.touchPage(tx, page.id);
      return toAdminBlock(current);
    });
  }

  private async requirePage(client: PrismaService | Tx, key: PageKey) {
    const row = await client.page.findUnique({
      where: { key: PAGE_KEY_TO_PRISMA[key] },
      include: pageWithAllBlocksInclude,
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${key} was not found` });
    }
    return row;
  }

  private requireBlock(page: Awaited<ReturnType<PagesService['requirePage']>>, id: number) {
    const block = page.blocks.find((row) => row.id === id);
    if (!block) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Block ${id} was not found on this page`,
      });
    }
    return block;
  }

  private async touchPage(tx: Tx, pageId: number): Promise<void> {
    await tx.page.update({
      where: { id: pageId },
      data: { updatedAt: new Date() },
    });
  }

  private async assertRefsExist(
    tx: Tx,
    definition: NonNullable<ReturnType<typeof definitionOf>>,
    props: unknown,
  ): Promise<void> {
    const refs = definition.refs(props as never);
    const projectIds = [
      ...new Set(refs.filter((ref) => ref.kind === 'project').map((ref) => ref.id)),
    ];
    const statIds = [...new Set(refs.filter((ref) => ref.kind === 'stat').map((ref) => ref.id))];
    const [projects, stats] = await Promise.all([
      projectIds.length > 0
        ? tx.project.findMany({ where: { id: { in: projectIds } }, select: { id: true } })
        : [],
      statIds.length > 0
        ? tx.profileStat.findMany({ where: { id: { in: statIds } }, select: { id: true } })
        : [],
    ]);
    const projectSet = new Set(projects.map((row) => row.id));
    const statSet = new Set(stats.map((row) => row.id));
    const fieldErrors: Record<string, string[]> = {};
    for (const ref of refs) {
      const exists =
        ref.kind === 'project'
          ? projectSet.has(ref.id)
          : ref.kind === 'stat'
            ? statSet.has(ref.id)
            : true;
      if (!exists) {
        const path = findRefPath(props, ref.id, 'props') ?? `props.${ref.kind}Id`;
        fieldErrors[path] = [`Unknown ${ref.kind} ${ref.id}`];
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors,
      });
    }
  }
}
