import { z } from 'zod';

import { defineBlock } from '../define-block.util';

export const notesBrowserPropsSchema = z.object({
  showFeatured: z
    .boolean()
    .meta({ widget: 'toggle', label: 'admin.blocks.notesBrowser.showFeatured' }),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(24)
    .default(10)
    .meta({ widget: 'number', label: 'admin.blocks.notesBrowser.pageSize' }),
});

export const notesBrowserBlock = defineBlock({
  type: 'notes-browser',
  version: 1,
  props: notesBrowserPropsSchema,
  defaults: {
    showFeatured: true,
    pageSize: 10,
  },
  pages: ['notes'],
  layouts: ['ONE'],
  maxPerPage: 1,
  role: 'required',
});
