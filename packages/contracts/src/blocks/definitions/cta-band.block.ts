import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedText } from '../localized.schema';

export const ctaBandPropsSchema = z.object({
  title: localizedText({ max: 120, label: 'admin.blocks.cta.title' }),
  intro: localizedText({ max: 400, label: 'admin.blocks.cta.intro' }).optional(),
  showEmail: z.boolean().meta({ widget: 'toggle', label: 'admin.blocks.cta.showEmail' }),
  showSocial: z.boolean().meta({ widget: 'toggle', label: 'admin.blocks.cta.showSocial' }),
});

export const ctaBandBlock = defineBlock({
  type: 'cta-band',
  version: 1,
  props: ctaBandPropsSchema,
  defaults: {
    title: { en: 'Have a product that needs to move forward?', vi: '' },
    showEmail: true,
    showSocial: true,
  },
  pages: ['home', 'about', 'projects', 'notes', 'contact'],
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'optional',
});
