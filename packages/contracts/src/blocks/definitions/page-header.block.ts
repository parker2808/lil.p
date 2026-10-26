import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedText } from '../localized.schema';

export const pageHeaderPropsSchema = z.object({
  eyebrow: localizedText({ max: 48, label: 'admin.blocks.pageHeader.eyebrow' }),
  title: localizedText({ max: 120, label: 'admin.blocks.pageHeader.title' }),
  intro: localizedText({ max: 400, label: 'admin.blocks.pageHeader.intro' }).optional(),
});

export const pageHeaderBlock = defineBlock({
  type: 'page-header',
  version: 1,
  props: pageHeaderPropsSchema,
  defaults: {
    eyebrow: { en: 'Work', vi: '' },
    title: { en: 'Case studies', vi: '' },
  },
  pages: ['projects', 'notes'],
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'h1',
});
