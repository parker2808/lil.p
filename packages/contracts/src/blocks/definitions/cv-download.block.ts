import { z } from 'zod';

import { defineBlock } from '../define-block.util';
import { sectionHeadingSchema } from '../localized.schema';

export const cvDownloadPropsSchema = z.object({
  heading: sectionHeadingSchema.optional(),
});

export const cvDownloadBlock = defineBlock({
  type: 'cv-download',
  version: 1,
  props: cvDownloadPropsSchema,
  defaults: {},
  pages: ['about', 'contact'],
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'optional',
});
