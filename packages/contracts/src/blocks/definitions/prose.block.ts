import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { localizedMarkdown, sectionHeadingSchema } from '../localized.schema';

export const prosePropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  body: localizedMarkdown({ label: 'admin.blocks.prose.body' }),
  aside: localizedMarkdown({ label: 'admin.blocks.prose.aside' }).optional(),
});

export const proseBlock = defineBlock({
  type: 'prose',
  version: 1,
  props: prosePropsSchema,
  defaults: {
    body: { en: 'Draft copy.', vi: '' },
  },
  pages: ['home', 'about', 'projects', 'notes', 'contact'],
  layouts: ['ONE', 'SPLIT_8_4'],
  role: 'optional',
});
