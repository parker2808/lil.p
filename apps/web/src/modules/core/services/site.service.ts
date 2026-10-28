import 'server-only';

import { type Locale, publicSiteSchema, type PublicSite } from '@portfolio/contracts';
import { cache } from 'react';

import { isPlaceholderText } from '../utils/placeholder.util';

import { apiServer } from './api-server.service';

export const getSite = cache(async (locale: Locale): Promise<PublicSite> => {
  const site = await apiServer('/api/public/site', {
    locale,
    tags: ['site'],
    schema: publicSiteSchema,
  });
  return {
    ...site,
    settings: {
      ...site.settings,
      availabilityNote: isPlaceholderText(site.settings.availabilityNote)
        ? ''
        : site.settings.availabilityNote,
      replyTimeNote: isPlaceholderText(site.settings.replyTimeNote)
        ? ''
        : site.settings.replyTimeNote,
      contactIntro: isPlaceholderText(site.settings.contactIntro) ? '' : site.settings.contactIntro,
    },
  };
});
