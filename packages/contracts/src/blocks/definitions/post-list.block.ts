import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const postListPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(6)
    .default(3)
    .meta({ widget: 'number', label: 'admin.blocks.postList.limit' }),
  tag: z.string().optional().meta({ widget: 'tag', label: 'admin.blocks.postList.tag' }),
});

export const postListBlock = defineBlock({
  type: 'post-list',
  version: 1,
  props: postListPropsSchema,
  defaults: {
    limit: 3,
  },
  pages: ['home', 'about', 'projects', 'contact'],
  layouts: ['ONE', 'TWO', 'THREE'],
  role: 'optional',
});
