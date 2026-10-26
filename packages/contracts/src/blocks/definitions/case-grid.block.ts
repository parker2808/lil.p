import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const caseGridPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  source: z
    .enum(['latest', 'featured', 'manual'])
    .meta({ widget: 'select', label: 'admin.blocks.caseGrid.source' }),
  projectIds: z
    .array(z.number().int())
    .default([])
    .meta({ widget: 'projectIds', label: 'admin.blocks.caseGrid.projectIds' }),
  domainSlug: z
    .string()
    .optional()
    .meta({ widget: 'domain', label: 'admin.blocks.caseGrid.domainSlug' }),
  limit: z
    .number()
    .int()
    .min(1)
    .max(6)
    .default(3)
    .meta({ widget: 'number', label: 'admin.blocks.caseGrid.limit' }),
});

export const caseGridBlock = defineBlock({
  type: 'case-grid',
  version: 1,
  props: caseGridPropsSchema,
  defaults: {
    source: 'latest',
    projectIds: [],
    limit: 3,
  },
  pages: ['home', 'about'],
  layouts: ['THREE', 'TWO', 'ONE'],
  role: 'optional',
  refs: (props) => props.projectIds.map((id) => ({ kind: 'project', id })),
});
