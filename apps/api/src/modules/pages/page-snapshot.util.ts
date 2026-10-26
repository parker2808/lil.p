import {
  BLOCK_REGISTRY,
  type BlockType,
  isLocalizedPair,
  type Locale,
  type PageKey,
  type PageSnapshot,
  type PageSnapshotBlock,
  pageSnapshotBlockSchema,
  pageSnapshotSchema,
  parseBlock,
  type PublicBlock,
  type PublicPage,
  publishLint,
  resolveBlockLocale,
} from '@portfolio/contracts';

import { pickGroup } from '../../i18n/pick-locale.util';
import type { PageWithAllBlocks } from './entities/page.entity';
import { definitionOf } from './pages-rules.util';

export type SnapshotBlockRow = PageSnapshotBlock & { id?: number };

export type InvalidSnapshotBlock = {
  id: number;
  type: string;
  key: string;
  issues: string[];
};

export function buildPageSnapshot(page: PageWithAllBlocks): PageSnapshot {
  return {
    seo: {
      seoTitleEn: page.seoTitleEn,
      seoTitleVi: page.seoTitleVi,
      seoDescriptionEn: page.seoDescriptionEn,
      seoDescriptionVi: page.seoDescriptionVi,
    },
    blocks: page.blocks.map((block) => ({
      type: block.type,
      key: block.key,
      schemaVersion: block.schemaVersion,
      props: block.props,
      layout: block.layout,
      surface: block.surface,
      isVisible: block.isVisible,
      sortOrder: block.sortOrder,
    })),
  };
}

export function readPageSnapshot(value: unknown): PageSnapshot | null {
  const parsed = pageSnapshotSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  if (!value || typeof value !== 'object') {
    return null;
  }
  const raw = value as { seo?: unknown; blocks?: unknown };
  const seo = {
    seoTitleEn: asNullableString(raw.seo, 'seoTitleEn'),
    seoTitleVi: asNullableString(raw.seo, 'seoTitleVi'),
    seoDescriptionEn: asNullableString(raw.seo, 'seoDescriptionEn'),
    seoDescriptionVi: asNullableString(raw.seo, 'seoDescriptionVi'),
  };
  const blocks = Array.isArray(raw.blocks)
    ? raw.blocks.flatMap((block) => {
        const item = pageSnapshotBlockSchema.safeParse(block);
        return item.success ? [item.data] : [];
      })
    : [];
  return { seo, blocks };
}

function asNullableString(source: unknown, key: string): string | null {
  if (!source || typeof source !== 'object') {
    return null;
  }
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}

export function snapshotToPublicPage(
  key: PageKey,
  snapshot: PageSnapshot,
  locale: Locale,
  onDropped: (info: { blockId: number; type: string; reason: string }) => void,
): PublicPage {
  const { values, lang } = pickGroup(snapshot.seo, ['seoTitle', 'seoDescription'] as const, locale);
  const blocks: PublicBlock[] = [];
  const visible = snapshot.blocks
    .filter((block) => block.isVisible)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const [index, block] of visible.entries()) {
    const parsed = parseBlock({
      id: index + 1,
      type: block.type,
      key: block.key,
      layout: block.layout,
      surface: block.surface,
      schemaVersion: block.schemaVersion,
      props: block.props,
    });
    if (!parsed.ok) {
      onDropped({ blockId: index + 1, type: block.type, reason: parsed.reason });
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
    key,
    seo: {
      title: values.seoTitle,
      description: values.seoDescription,
      lang,
    },
    blocks,
  };
}

export function draftToPublicBlocks(
  blocks: PageWithAllBlocks['blocks'],
  locale: Locale,
): { blocks: PublicBlock[]; invalidBlocks: InvalidSnapshotBlock[] } {
  const publicBlocks: PublicBlock[] = [];
  const invalidBlocks: InvalidSnapshotBlock[] = [];
  const ordered = blocks.slice().sort((a, b) => a.sortOrder - b.sortOrder);

  for (const block of ordered) {
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
      invalidBlocks.push({
        id: block.id,
        type: block.type,
        key: block.key,
        issues: parsed.issues,
      });
      continue;
    }
    if (!block.isVisible) {
      continue;
    }
    const localized = resolveBlockLocale(parsed.block.props, locale);
    publicBlocks.push({
      id: parsed.block.id,
      type: parsed.block.type,
      key: parsed.block.key,
      layout: parsed.block.layout,
      surface: parsed.block.surface,
      props: localized.props,
      lang: localized.lang,
    });
  }

  return { blocks: publicBlocks, invalidBlocks };
}

export function collectTextFields(value: unknown, prefix = ''): Record<string, string> {
  const fields: Record<string, string> = {};
  walkText(value, prefix, fields);
  return fields;
}

function walkText(value: unknown, prefix: string, out: Record<string, string>): void {
  if (typeof value === 'string') {
    if (prefix) {
      out[prefix] = value;
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkText(item, `${prefix}.${index}`, out));
    return;
  }
  if (value && typeof value === 'object') {
    if (isLocalizedPair(value)) {
      out[prefix ? `${prefix}.en` : 'en'] = value.en;
      if (typeof value.vi === 'string') {
        out[prefix ? `${prefix}.vi` : 'vi'] = value.vi;
      }
      return;
    }
    for (const [key, item] of Object.entries(value)) {
      walkText(item, prefix ? `${prefix}.${key}` : key, out);
    }
  }
}

export function lintSnapshotFields(
  seo: PageSnapshot['seo'],
  blocks: Array<{ key: string; props: unknown }>,
): Record<string, string[]> {
  const fields = {
    ...collectTextFields(seo.seoTitleEn, 'seoTitleEn'),
    ...collectTextFields(seo.seoTitleVi, 'seoTitleVi'),
    ...collectTextFields(seo.seoDescriptionEn, 'seoDescriptionEn'),
    ...collectTextFields(seo.seoDescriptionVi, 'seoDescriptionVi'),
  };
  for (const block of blocks) {
    Object.assign(fields, collectTextFields(block.props, `block:${block.key}`));
  }
  return publishLint(fields).fieldErrors;
}

export function snapshotBlockCount(snapshot: PageSnapshot): number {
  return snapshot.blocks.length;
}

export function blockRefsOf(type: string, props: unknown): Array<{ kind: string; id: number }> {
  const definition = definitionOf(type) ?? BLOCK_REGISTRY[type as BlockType];
  if (!definition) {
    return [];
  }
  return definition.refs(props as never);
}
