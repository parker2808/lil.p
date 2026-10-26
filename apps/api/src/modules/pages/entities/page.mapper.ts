import {
  type AdminBlock,
  type AdminPage,
  type AdminPageListItem,
  type Locale,
  parseBlock,
  PRISMA_PAGE_KEY_TO_PUBLIC,
  type PublicBlock,
  type PublicPage,
  resolveBlockLocale,
} from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { PageWithAllBlocks, PageWithBlocks } from './page.entity';

export function toPublicPage(
  row: PageWithBlocks,
  locale: Locale,
  onDropped: (info: { blockId: number; type: string; reason: string }) => void,
): PublicPage {
  const { values, lang } = pickGroup(row, ['seoTitle', 'seoDescription'] as const, locale);

  const blocks: PublicBlock[] = [];
  for (const block of row.blocks) {
    const parsed = parseBlock({
      id: block.id,
      type: block.type,
      key: block.key,
      layout: block.layout,
      surface: block.surface,
      schemaVersion: block.schemaVersion,
      props: block.props,
    });
    if (!parsed.ok) {
      onDropped({ blockId: block.id, type: block.type, reason: parsed.reason });
      continue;
    }
    const localized = resolveBlockLocale(parsed.block.props, locale);
    blocks.push({
      id: parsed.block.id,
      type: parsed.block.type,
      key: parsed.block.key,
      layout: parsed.block.layout,
      surface: parsed.block.surface,
      props: localized.props,
      lang: localized.lang,
    });
  }

  return {
    key: PRISMA_PAGE_KEY_TO_PUBLIC[row.key],
    seo: {
      title: values.seoTitle,
      description: values.seoDescription,
      lang,
    },
    blocks,
  };
}

export function toAdminBlock(block: PageWithAllBlocks['blocks'][number]): AdminBlock {
  const parsed = parseBlock({
    id: block.id,
    type: block.type,
    key: block.key,
    layout: block.layout,
    surface: block.surface,
    schemaVersion: block.schemaVersion,
    props: block.props,
  });

  return {
    id: block.id,
    type: block.type,
    key: block.key,
    layout: block.layout,
    surface: block.surface,
    schemaVersion: block.schemaVersion,
    props: parsed.ok ? parsed.block.props : block.props,
    isVisible: block.isVisible,
    sortOrder: block.sortOrder,
    updatedAt: block.updatedAt.toISOString(),
    ...(parsed.ok ? {} : { issues: parsed.issues }),
  };
}

export function toAdminPage(
  row: PageWithAllBlocks & {
    publishedAt?: Date | null;
    publishedVersion?: { version: number } | null;
  },
): AdminPage {
  return {
    key: PRISMA_PAGE_KEY_TO_PUBLIC[row.key],
    seoTitleEn: row.seoTitleEn,
    seoTitleVi: row.seoTitleVi,
    seoDescriptionEn: row.seoDescriptionEn,
    seoDescriptionVi: row.seoDescriptionVi,
    updatedAt: row.updatedAt.toISOString(),
    publishedVersion: row.publishedVersion?.version ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: hasUnpublishedChanges(row.updatedAt, row.publishedAt ?? null),
    blocks: row.blocks.map(toAdminBlock),
  };
}

export function toAdminPageListItem(row: {
  key: PageWithAllBlocks['key'];
  updatedAt: Date;
  publishedAt?: Date | null;
  publishedVersion?: { version: number } | null;
  _count: { blocks: number };
}): AdminPageListItem {
  return {
    key: PRISMA_PAGE_KEY_TO_PUBLIC[row.key],
    blockCount: row._count.blocks,
    updatedAt: row.updatedAt.toISOString(),
    publishedVersion: row.publishedVersion?.version ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: hasUnpublishedChanges(row.updatedAt, row.publishedAt ?? null),
  };
}

export function hasUnpublishedChanges(updatedAt: Date, publishedAt: Date | null): boolean {
  if (!publishedAt) {
    return true;
  }
  return updatedAt.getTime() > publishedAt.getTime();
}
