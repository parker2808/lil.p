import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const statBandPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
  variant: z
    .enum(['default', 'compact'])
    .meta({ widget: 'select', label: 'admin.blocks.statBand.variant' }),
  statIds: z
    .array(z.number().int())
    .default([])
    .meta({ widget: 'statIds', label: 'admin.blocks.statBand.statIds' }),
});

export const statBandBlock = defineBlock({
  type: 'stat-band',
  version: 1,
  props: statBandPropsSchema,
  defaults: {
    variant: 'default',
    statIds: [],
  },
  pages: ['home', 'about'],
  layouts: ['ONE'],
  role: 'optional',
  refs: (props) => props.statIds.map((id) => ({ kind: 'stat', id })),
});
