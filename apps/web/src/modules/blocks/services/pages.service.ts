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

import { apiServer } from '@/modules/core/services/api-server.service';

const treePageSchema = z.strictObject({
  key: pageKeySchema,
  seo: publicPageSchema.shape.seo,
  tree: z.unknown(),
});
const treePreviewSchema = treePageSchema.extend({ invalidBlocks: z.tuple([]) });

export type TreePage = z.infer<typeof treePageSchema>;

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
    return apiServer(`/api/public/pages/${key}`, {
      locale,
      tags: [`page:${key}`],
      schema: z.union([treePageSchema, publicPageSchema]),
    });
  },
);
