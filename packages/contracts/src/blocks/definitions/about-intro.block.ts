import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedText } from '../localized.schema';

export const aboutIntroPropsSchema = z.object({
  eyebrow: localizedText({ max: 48, label: 'admin.blocks.aboutIntro.eyebrow' }),
  showCity: z.boolean().meta({ widget: 'toggle', label: 'admin.blocks.aboutIntro.showCity' }),
  showAvailability: z
    .boolean()
    .meta({ widget: 'toggle', label: 'admin.blocks.aboutIntro.showAvailability' }),
});

export const aboutIntroBlock = defineBlock({
  type: 'about-intro',
  version: 1,
  props: aboutIntroPropsSchema,
  defaults: {
    eyebrow: { en: 'About', vi: '' },
    showCity: true,
    showAvailability: true,
  },
  pages: ['about'],
  layouts: ['SPLIT_4_8', 'ONE'],
  maxPerPage: 1,
  role: 'h1',
});
