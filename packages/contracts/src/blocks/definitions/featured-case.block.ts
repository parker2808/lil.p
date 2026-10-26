import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const featuredCasePropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  projectId: z
    .number()
    .int()
    .nullable()
    .default(null)
    .meta({ widget: 'project', label: 'admin.blocks.featuredCase.projectId' }),
});

export const featuredCaseBlock = defineBlock({
  type: 'featured-case',
  version: 1,
  props: featuredCasePropsSchema,
  defaults: {
    projectId: null,
  },
  pages: ['home'],
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'optional',
  refs: (props) => (props.projectId ? [{ kind: 'project', id: props.projectId }] : []),
});
