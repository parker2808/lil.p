import { createHash } from 'node:crypto';

import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import type { ReactNode } from 'react';
import {
  BLOCK_REGISTRY,
  HOST_TREE_REGISTRY,
  resolveBlockLocale,
  type BlockType,
  type Locale,
  type PageKey,
  type PublicBlock,
  type PublicPagePreview,
} from '@portfolio/contracts';
import { renderTree } from '@parker2808/cms-core/react/server';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createElement } from 'react';

import { BlockRenderer } from '../components/BlockRenderer/BlockRenderer';
import { BLOCK_RENDERERS } from '../constants/block-renderers.constant';
import { getPage } from '../services/pages.service';
import { previewVersion } from '../utils/preview-version.util';

export async function BlocksPage({
  pageKey,
  locale,
  searchParams,
  brand = 'lilp',
}: {
  pageKey: PageKey;
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
  brand?: 'neutral' | 'lilp';
}) {
  const page = await getPage(pageKey, locale, previewVersion(searchParams));
  const draft = await draftMode();
  const t = await getTranslations('states');
  const preview = page as PublicPagePreview;
  if ('tree' in page) {
    const pending: Array<Promise<void>> = [];
    const rendered = new Map<string, ReactNode>();
    const components = Object.fromEntries(
      Object.entries(BLOCK_RENDERERS).map(([type, entry]) => [
        type,
        (node: { id: string }, props: Record<string, unknown>) => {
          const resolved = resolveBlockLocale(props, locale);
          const renderKey = JSON.stringify([node.id, type, resolved.props, resolved.lang]);
          const block: PublicBlock = {
            id: 0,
            key: node.id,
            type: type as BlockType,
            layout: BLOCK_REGISTRY[type as BlockType].layouts[0]!,
            surface: 'PLAIN',
            props: resolved.props,
            lang: resolved.lang,
          };
          pending.push(
            Promise.resolve(entry.component({ block, context: { locale, searchParams } })).then(
              (content) => {
                rendered.set(renderKey, content);
              },
            ),
          );
          return null;
        },
      ]),
    );
    const options = {
      input: page.tree,
      registry: HOST_TREE_REGISTRY,
      createElement,
      labels: { unsupported: t('error') },
    };
    const collected = renderTree({ ...options, components });
    if (!collected.ok) notFound();
    await Promise.all(pending);
    const result = renderTree({
      ...options,
      components: Object.fromEntries(
        Object.keys(BLOCK_RENDERERS).map((type) => [
          type,
          (node: { id: string }, props: Record<string, unknown>) => {
            const resolved = resolveBlockLocale(props, locale);
            const renderKey = JSON.stringify([node.id, type, resolved.props, resolved.lang]);
            if (!rendered.has(renderKey)) throw new Error('Missing resolved host block');
            return createElement(
              'div',
              {
                'data-host-block-type': type,
                'data-host-props-hash': createHash('sha256')
                  .update(JSON.stringify({ props: resolved.props, lang: resolved.lang }))
                  .digest('hex'),
              },
              rendered.get(renderKey),
            );
          },
        ]),
      ),
    });
    if (!result.ok) notFound();
    return (
      <main className="cms-core cms-core-host" data-brand={brand}>
        {result.content}
      </main>
    );
  }
  // Resolve async blocks before writing their wrappers. This also preserves a complete
  // initial HTML document without the client script needed to reveal streamed chunks.
  const resolved: Record<number, ReactNode> = Object.fromEntries(
    await Promise.all(
      page.blocks.map(async (block) => {
        try {
          const entry = BLOCK_RENDERERS[block.type];
          return [
            block.id,
            entry ? await entry.component({ block, context: { locale, searchParams } }) : null,
          ];
        } catch {
          return [
            block.id,
            <ErrorState key={block.id} message={t('error')} retryLabel={t('retry')} />,
          ];
        }
      }),
    ),
  );

  return (
    <BlockRenderer
      blocks={page.blocks}
      resolved={resolved}
      invalidBlocks={'invalidBlocks' in preview ? preview.invalidBlocks : []}
      draft={draft.isEnabled}
      context={{ locale, searchParams }}
      labels={{ error: t('error'), retry: t('retry'), empty: t('empty'), unknown: t('empty') }}
      registry={BLOCK_RENDERERS}
    />
  );
}
