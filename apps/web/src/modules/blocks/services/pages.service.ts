import 'server-only';

import {
  type Locale,
  type PageKey,
  publicPagePreviewSchema,
  publicPageSchema,
  type PublicPage,
  type PublicPagePreview,
  pageKeySchema,
} from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { cache } from 'react';
import { z } from 'zod';
import { readTree } from '@parker2808/cms-core/tree';
import { HOST_TREE_REGISTRY } from '@portfolio/contracts';

import { apiServer } from '@/modules/core/services/api-server.service';
import { guardPublicText } from '@/modules/core/utils/placeholder.util';

const treePageSchema = z.strictObject({
  key: pageKeySchema,
  seo: publicPageSchema.shape.seo,
  tree: z.unknown(),
});
const treePreviewSchema = treePageSchema.extend({ invalidBlocks: z.tuple([]) });
const publicContentSchema = z.union([treePageSchema, publicPageSchema]);
const cmsSeoSchema = z.strictObject(publicPageSchema.shape.seo.shape);
const cmsPublishedSchema = z.strictObject({
  contractVersion: z.literal(1),
  publishedVersion: z.number().int().positive(),
  page: z.union([
    treePageSchema.extend({ seo: cmsSeoSchema }),
    z.strictObject({
      ...publicPageSchema.shape,
      seo: cmsSeoSchema,
      blocks: z.array(z.strictObject(publicPageSchema.shape.blocks.element.shape)),
    }),
  ]),
});
const lastGood = new Map<
  string,
  { version: number; page: PublicPage | TreePage; savedAt: number }
>();
const lastGoodMs = 24 * 60 * 60 * 1000;
class TransientCmsError extends Error {}

export type TreePage = z.infer<typeof treePageSchema>;

async function getPublishedPage(key: PageKey, locale: Locale): Promise<PublicPage | TreePage> {
  const legacy = () =>
    apiServer(`/api/public/pages/${key}`, {
      locale,
      tags: [`page:${key}`],
      schema: publicContentSchema,
    });

  if (process.env.CMS_PAGE_READ_SOURCE !== 'cms') return legacy();
  const cacheKey = `${key}:${locale}`;
  try {
    const origin = process.env.CMS_PUBLIC_API_ORIGIN;
    if (!origin) throw new Error('CMS public origin is not configured');
    const base = new URL(origin);
    if (
      base.protocol !== 'https:' &&
      !(base.protocol === 'http:' && base.hostname === 'localhost')
    ) {
      throw new Error('Invalid CMS public origin');
    }
    if (base.username || base.password || base.search || base.hash || base.pathname !== '/') {
      throw new Error('Invalid CMS public origin');
    }
    const url = new URL(`/api/public/pages/${encodeURIComponent(key)}`, base);
    url.searchParams.set('locale', locale);
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(2500),
        next: { revalidate: 30, tags: [`cms:page:${key}:${locale}`] },
      });
    } catch {
      throw new TransientCmsError();
    }
    if (!response.ok) {
      if (response.status >= 500) throw new TransientCmsError();
      throw new Error('CMS published Page not available');
    }
    const parsed = cmsPublishedSchema.parse(await response.json());
    if (parsed.page.key !== key || parsed.page.seo.lang !== locale) {
      throw new Error('CMS published Page key or locale mismatch');
    }
    if ('tree' in parsed.page && !readTree(parsed.page.tree, HOST_TREE_REGISTRY).ok) {
      throw new Error('Invalid published Page tree');
    }
    const page = guardPublicText(parsed.page);
    const previous = lastGood.get(cacheKey);
    if (!previous || parsed.publishedVersion >= previous.version) {
      if (!previous && lastGood.size >= 128) lastGood.delete(lastGood.keys().next().value!);
      lastGood.set(cacheKey, { version: parsed.publishedVersion, page, savedAt: Date.now() });
    }
    return lastGood.get(cacheKey)!.page;
  } catch (error) {
    if (!(error instanceof TransientCmsError))
      throw new Error('Published Page temporarily unavailable');
    const previous = lastGood.get(cacheKey);
    if (previous && Date.now() - previous.savedAt <= lastGoodMs) return previous.page;
    lastGood.delete(cacheKey);
    if (process.env.CMS_LEGACY_READ_FALLBACK_ENABLED === 'true') return legacy();
    throw new Error('Published Page temporarily unavailable');
  }
}

export const getPage = cache(
  async (
    key: PageKey,
    locale: Locale,
    version?: number,
  ): Promise<PublicPage | PublicPagePreview | TreePage> => {
    const draft = await draftMode();
    if (draft.isEnabled) {
      const qs = version ? `?version=${version}` : '';
      return apiServer(`/api/admin/preview/pages/${key}${qs}`, {
        locale,
        withAuth: true,
        schema: z.union([treePreviewSchema, publicPagePreviewSchema]),
      });
    }
    return getPublishedPage(key, locale);
  },
);
