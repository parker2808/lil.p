import { z } from 'zod';

import { defineBlock } from '../define-block.util';

export const projectsBrowserPropsSchema = z.object({
  showFeatured: z
    .boolean()
    .meta({ widget: 'toggle', label: 'admin.blocks.projectsBrowser.showFeatured' }),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(24)
    .default(6)
    .meta({ widget: 'number', label: 'admin.blocks.projectsBrowser.pageSize' }),
});

export const projectsBrowserBlock = defineBlock({
  type: 'projects-browser',
  version: 1,
  props: projectsBrowserPropsSchema,
  defaults: {
    showFeatured: true,
    pageSize: 6,
  },
  pages: ['projects'],
  layouts: ['TWO', 'THREE'],
  maxPerPage: 1,
  role: 'required',
});
