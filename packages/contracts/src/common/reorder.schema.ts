import { z } from 'zod';

export const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
