import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const processPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  showPrinciples: z
    .boolean()
    .meta({ widget: 'toggle', label: 'admin.blocks.process.showPrinciples' }),
});

export const processBlock = defineBlock({
  type: 'process',
  version: 1,
  props: processPropsSchema,
  defaults: {
    showPrinciples: true,
  },
  pages: ['home'],
  layouts: ['TWO', 'ONE'],
  maxPerPage: 1,
  role: 'optional',
});
