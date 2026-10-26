import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BLOCK_REGISTRY,
  type Locale,
  PAGE_KEY_TO_PRISMA,
  type PageKey,
  type PageSnapshot,
  parseBlock,
  type PublicPagePreview,
  type PublishPageInput,
} from '@portfolio/contracts';

import type { Prisma } from '../../generated/prisma/client';
import { pickGroup } from '../../i18n/pick-locale.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  lintErrors,
  mergeFieldErrors,
  requiredFieldErrors,
} from '../publishing/publish-rules.util';
import { PublishingService } from '../publishing/publishing.service';
import { pageTags } from '../publishing/tags.util';
import type { PageWithAllBlocks } from './entities/page.entity';
import { pageWithAllBlocksInclude } from './entities/page.entity';
import { toAdminPage } from './entities/page.mapper';
import {
  draftToPublicBlocks,
  type InvalidSnapshotBlock,
  lintSnapshotFields,
  readPageSnapshot,
  snapshotBlockCount,
  snapshotToPublicPage,
} from './page-snapshot.util';
import {
  assertAllowedOnPage,
  assertLayoutAllowed,
  definitionOf,
  parsePageKey,
} from './pages-rules.util';

type Tx = Prisma.TransactionClient;

@Injectable()
export class PageVersionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly publishing?: PublishingService,
    @Optional() private readonly events?: EventEmitter2,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async listVersions(rawKey: string) {
    const key = parsePageKey(rawKey);
    const page = await this.requirePage(this.prisma, key);
    const rows = await this.prisma.pageVersion.findMany({
      where: { pageId: page.id },
      orderBy: { version: 'desc' },
      include: { createdBy: { select: { name: true } } },
    });
    return rows.map((row) => {
      const snapshot = readPageSnapshot(row.snapshot);
      return {
        version: row.version,
        createdAt: row.createdAt.toISOString(),
        authorName: row.createdBy?.name ?? null,
        note: row.note,
        blockCount: snapshot ? snapshotBlockCount(snapshot) : 0,
      };
    });
  }

  async getVersion(rawKey: string, version: number) {
    const key = parsePageKey(rawKey);
    const page = await this.requirePage(this.prisma, key);
    const row = await this.prisma.pageVersion.findUnique({
      where: { pageId_version: { pageId: page.id, version } },
      include: { createdBy: { select: { name: true } } },
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Version ${version} was not found`,
      });
    }
    const snapshot = readPageSnapshot(row.snapshot);
    if (!snapshot) {
      throw new BadRequestException({
        code: 'INVALID_BLOCKS',
        message: 'This version snapshot could not be read',
        fieldErrors: { snapshot: ['Invalid snapshot'] },
      });
    }
    return {
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      authorName: row.createdBy?.name ?? null,
      note: row.note,
      blockCount: snapshotBlockCount(snapshot),
      snapshot,
    };
  }

  async publish(rawKey: string, input: PublishPageInput, actorId: number | null) {
    const key = parsePageKey(rawKey);
    const result = await this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      const snapshot = await this.assertPublishable(tx, key, page);
      const latest = await tx.pageVersion.aggregate({
        where: { pageId: page.id },
        _max: { version: true },
      });
      const version = (latest._max.version ?? 0) + 1;
      const created = await tx.pageVersion.create({
        data: {
          pageId: page.id,
          version,
          snapshot: snapshot as Prisma.InputJsonValue,
          note: input.note,
          createdById: actorId,
        },
      });
      const now = new Date();
      await tx.page.update({
        where: { id: page.id },
        data: {
          publishedVersionId: created.id,
          publishedAt: now,
          updatedAt: now,
        },
      });
      await this.audit?.record(tx, {
        userId: actorId,
        action: 'PUBLISH',
        entityType: 'page',
        entityId: key,
        summary: `Published ${key} v${version}`,
      });
      return toAdminPage(await this.requirePage(tx, key));
    });
    this.events?.emit('content.published', { entity: 'page', key });
    void this.publishing?.revalidate(pageTags(key));
    return result;
  }

  async restore(rawKey: string, version: number) {
    const key = parsePageKey(rawKey);
    return this.prisma.$transaction(async (tx) => {
      const page = await this.requirePage(tx, key);
      const row = await tx.pageVersion.findUnique({
        where: { pageId_version: { pageId: page.id, version } },
      });
      if (!row) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: `Version ${version} was not found`,
        });
      }
      const snapshot = readPageSnapshot(row.snapshot);
      if (!snapshot) {
        throw new BadRequestException({
          code: 'INVALID_BLOCKS',
          message: 'This version snapshot could not be read',
          fieldErrors: { snapshot: ['Invalid snapshot'] },
        });
      }
      await this.applySnapshot(tx, page.id, snapshot);
      await this.audit?.record(tx, {
        action: 'RESTORE',
        entityType: 'page',
        entityId: key,
        summary: `Restored ${key} to v${version}`,
      });
      return toAdminPage(await this.requirePage(tx, key));
    });
  }

  async discard(rawKey: string) {
    const key = parsePageKey(rawKey);
    const page = await this.requirePage(this.prisma, key);
    if (!page.publishedVersionId) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'This page has never been published',
      });
    }
    const published = await this.prisma.pageVersion.findUnique({
      where: { id: page.publishedVersionId },
    });
    if (!published) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'The published version was not found',
      });
    }
    return this.restore(rawKey, published.version);
  }

  async getPreview(rawKey: string, locale: Locale, version?: number): Promise<PublicPagePreview> {
    const key = parsePageKey(rawKey);
    const page = await this.requirePage(this.prisma, key);

    if (version !== undefined) {
      const row = await this.prisma.pageVersion.findUnique({
        where: { pageId_version: { pageId: page.id, version } },
      });
      if (!row) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: `Version ${version} was not found`,
        });
      }
      const snapshot = readPageSnapshot(row.snapshot);
      if (!snapshot) {
        return {
          key,
          seo: { title: null, description: null, lang: locale },
          blocks: [],
          invalidBlocks: [
            { id: 0, type: 'snapshot', key: 'snapshot', issues: ['Invalid snapshot'] },
          ],
        };
      }
      const invalidBlocks: InvalidSnapshotBlock[] = [];
      for (const [index, block] of snapshot.blocks.entries()) {
        const parsed = parseSnapshotBlock(block, index + 1);
        if (!parsed.ok) {
          invalidBlocks.push(parsed.invalid);
        }
      }
      return {
        ...snapshotToPublicPage(key, snapshot, locale, () => undefined),
        invalidBlocks,
      };
    }

    const { values, lang } = pickGroup(page, ['seoTitle', 'seoDescription'] as const, locale);
    const draft = draftToPublicBlocks(page.blocks, locale);
    return {
      key,
      seo: {
        title: values.seoTitle,
        description: values.seoDescription,
        lang,
      },
      blocks: draft.blocks,
      invalidBlocks: draft.invalidBlocks,
    };
  }

  private async applySnapshot(tx: Tx, pageId: number, snapshot: PageSnapshot): Promise<void> {
    await tx.pageBlock.deleteMany({ where: { pageId } });
    if (snapshot.blocks.length > 0) {
      await tx.pageBlock.createMany({
        data: snapshot.blocks.map((block) => ({
          pageId,
          type: block.type,
          key: block.key,
          schemaVersion: block.schemaVersion,
          props: block.props as Prisma.InputJsonValue,
          layout: block.layout,
          surface: block.surface,
          isVisible: block.isVisible,
          sortOrder: block.sortOrder,
        })),
      });
    }
    await tx.page.update({
      where: { id: pageId },
      data: {
        seoTitleEn: snapshot.seo.seoTitleEn,
        seoTitleVi: snapshot.seo.seoTitleVi,
        seoDescriptionEn: snapshot.seo.seoDescriptionEn,
        seoDescriptionVi: snapshot.seo.seoDescriptionVi,
        updatedAt: new Date(),
      },
    });
  }

  private async assertPublishable(
    tx: Tx,
    key: PageKey,
    page: PageWithAllBlocks,
  ): Promise<PageSnapshot> {
    const ordered = page.blocks.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const h1 = ordered.find((block) => definitionOf(block.type)?.role === 'h1');
    if (!h1) {
      throw new ConflictException({
        code: 'BLOCK_LOCKED',
        message: 'The page needs an H1 block',
      });
    }
    if (ordered[0]?.id !== h1.id) {
      throw new ConflictException({
        code: 'BLOCK_LOCKED',
        message: 'The H1 block must stay first',
      });
    }

    for (const definition of Object.values(BLOCK_REGISTRY)) {
      if (definition.role !== 'required' || !definition.pages.includes(key)) {
        continue;
      }
      const present = ordered.some((block) => block.type === definition.type && block.isVisible);
      if (!present) {
        throw new ConflictException({
          code: 'BLOCK_REQUIRED',
          message: `A required ${definition.type} block is missing`,
        });
      }
    }

    const counts = new Map<string, number>();
    const invalid: Record<string, string[]> = {};
    const snapshotBlocks: PageSnapshot['blocks'] = [];

    for (const block of ordered) {
      const definition = definitionOf(block.type);
      if (definition) {
        if (block.isVisible) {
          assertAllowedOnPage(definition, key);
          assertLayoutAllowed(definition, block.layout);
        }
        counts.set(block.type, (counts.get(block.type) ?? 0) + 1);
        const count = counts.get(block.type) ?? 0;
        if (definition.maxPerPage !== undefined && count > definition.maxPerPage) {
          throw new ConflictException({
            code: 'BLOCK_LIMIT',
            message: `${definition.type} is limited to ${definition.maxPerPage} per page`,
          });
        }
      }

      const parsed = parseSnapshotBlock(
        {
          type: block.type,
          key: block.key,
          schemaVersion: block.schemaVersion,
          props: block.props,
          layout: block.layout,
          surface: block.surface,
          isVisible: block.isVisible,
          sortOrder: block.sortOrder,
        },
        block.id,
      );
      if (!parsed.ok) {
        if (block.isVisible) {
          invalid[`block:${block.key}`] = parsed.invalid.issues;
        }
        continue;
      }
      if (definition && block.isVisible) {
        await this.assertRefsExist(tx, definition, parsed.props, block.key);
      }
      snapshotBlocks.push({
        type: block.type,
        key: block.key,
        schemaVersion: block.schemaVersion,
        props: parsed.props,
        layout: block.layout,
        surface: block.surface,
        isVisible: block.isVisible,
        sortOrder: block.sortOrder,
      });
    }

    if (Object.keys(invalid).length > 0) {
      throw new BadRequestException({
        code: 'INVALID_BLOCKS',
        message: 'One or more visible blocks are invalid',
        fieldErrors: invalid,
      });
    }

    const seo = {
      seoTitleEn: page.seoTitleEn,
      seoTitleVi: page.seoTitleVi,
      seoDescriptionEn: page.seoDescriptionEn,
      seoDescriptionVi: page.seoDescriptionVi,
    };
    const fieldErrors = mergeFieldErrors(
      requiredFieldErrors({ seoTitleEn: page.seoTitleEn }),
      lintSnapshotFields(
        seo,
        snapshotBlocks.filter((block) => block.isVisible),
      ),
      lintErrors({ seoTitleEn: page.seoTitleEn, seoDescriptionEn: page.seoDescriptionEn }),
    );
    if (Object.keys(fieldErrors).length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors,
      });
    }

    return { seo, blocks: snapshotBlocks };
  }

  private async assertRefsExist(
    tx: Tx,
    definition: NonNullable<ReturnType<typeof definitionOf>>,
    props: unknown,
    blockKey: string,
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
        fieldErrors[`block:${blockKey}.${ref.kind}Id`] = [`Unknown ${ref.kind} ${ref.id}`];
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

  private async requirePage(client: PrismaService | Tx, key: PageKey) {
    const row = await client.page.findUnique({
      where: { key: PAGE_KEY_TO_PRISMA[key] },
      include: {
        ...pageWithAllBlocksInclude,
        publishedVersion: true,
      },
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Page ${key} was not found` });
    }
    return row;
  }
}

function parseSnapshotBlock(
  block: PageSnapshot['blocks'][number],
  id: number,
): { ok: true; props: unknown } | { ok: false; invalid: InvalidSnapshotBlock } {
  const parsed = parseBlock({
    id,
    type: block.type,
    key: block.key,
    layout: block.layout,
    surface: block.surface,
    schemaVersion: block.schemaVersion,
    props: block.props,
  });
  if (!parsed.ok) {
    return {
      ok: false,
      invalid: { id, type: block.type, key: block.key, issues: parsed.issues },
    };
  }
  return { ok: true, props: parsed.block.props };
}
