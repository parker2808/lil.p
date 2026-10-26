import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const techMarqueePropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const techMarqueeBlock = defineBlock({
  type: 'tech-marquee',
  version: 1,
  props: techMarqueePropsSchema,
  defaults: {},
  pages: ['home', 'about'],
  layouts: ['ONE'],
  role: 'optional',
});
