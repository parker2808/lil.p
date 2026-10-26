import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const skillGroupsPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const skillGroupsBlock = defineBlock({
  type: 'skill-groups',
  version: 1,
  props: skillGroupsPropsSchema,
  defaults: {},
  pages: ['home', 'about'],
  layouts: ['THREE', 'ONE'],
  role: 'optional',
});
