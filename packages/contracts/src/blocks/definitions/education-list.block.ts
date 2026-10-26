import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const educationListPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const educationListBlock = defineBlock({
  type: 'education-list',
  version: 1,
  props: educationListPropsSchema,
  defaults: {},
  pages: ['about'],
  layouts: ['ONE', 'TWO'],
  role: 'optional',
});
