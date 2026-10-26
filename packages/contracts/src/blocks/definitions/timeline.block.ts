import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const timelinePropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const timelineBlock = defineBlock({
  type: 'timeline',
  version: 1,
  props: timelinePropsSchema,
  defaults: {},
  pages: ['about'],
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'optional',
});
