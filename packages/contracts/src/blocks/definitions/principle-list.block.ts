import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const principleListPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const principleListBlock = defineBlock({
  type: 'principle-list',
  version: 1,
  props: principleListPropsSchema,
  defaults: {},
  pages: ['about', 'home'],
  layouts: ['TWO', 'ONE'],
  role: 'optional',
});
