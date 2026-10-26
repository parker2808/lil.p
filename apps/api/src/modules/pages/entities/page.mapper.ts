import {
  type Locale,
  parseBlock,
  PRISMA_PAGE_KEY_TO_PUBLIC,
  type PublicBlock,
  type PublicPage,
  resolveBlockLocale,
} from '@portfolio/contracts';

import { pickGroup } from '../../../i18n/pick-locale.util';
import type { PageWithBlocks } from './page.entity';

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
