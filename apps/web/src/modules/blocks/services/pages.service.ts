import 'server-only';

import {
  type Locale,
  type PageKey,
  publicPagePreviewSchema,
  publicPageSchema,
  type PublicPage,
  type PublicPagePreview,
} from '@portfolio/contracts';
import { draftMode } from 'next/headers';
import { cache } from 'react';

import { apiServer } from '@/modules/core/services/api-server.service';

export const getPage = cache(
  async (
    key: PageKey,
    locale: Locale,
    version?: number,
  ): Promise<PublicPage | PublicPagePreview> => {
    const draft = await draftMode();
    if (draft.isEnabled) {
      const qs = version ? `?version=${version}` : '';
      return apiServer(`/api/admin/preview/pages/${key}${qs}`, {
        locale,
        withAuth: true,
        schema: publicPagePreviewSchema,
      });
    }
    return apiServer(`/api/public/pages/${key}`, {
      locale,
      tags: [`page:${key}`],
      schema: publicPageSchema,
    });
  },
);
