import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedMarkdown, sectionHeadingSchema } from '../localized.schema';

export const prosePropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  body: z.object({
    en: z.string().meta({ widget: 'markdown', label: 'admin.blocks.prose.body' }),
    vi: z
      .string()
      .optional()
      .default('')
      .meta({ widget: 'markdown', label: 'admin.blocks.field.vi' }),
  }),
  aside: localizedMarkdown({ label: 'admin.blocks.prose.aside' }).optional(),
});

export const proseBlock = defineBlock({
  type: 'prose',
  version: 1,
  props: prosePropsSchema,
  defaults: {
    body: { en: '', vi: '' },
  },
  pages: ['home', 'about', 'projects', 'notes', 'contact'],
  layouts: ['ONE', 'SPLIT_8_4'],
  role: 'optional',
});
