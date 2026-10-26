import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const domainGridPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const domainGridBlock = defineBlock({
  type: 'domain-grid',
  version: 1,
  props: domainGridPropsSchema,
  defaults: {},
  pages: ['home', 'projects'],
  layouts: ['FOUR', 'TWO'],
  role: 'optional',
});
