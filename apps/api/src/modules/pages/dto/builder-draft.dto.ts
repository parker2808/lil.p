import { z } from 'zod';

export const revisionSchema = z
  .string()
  .regex(/^(0|[1-9][0-9]*)$/)
  .refine((value) => BigInt(value) <= 9223372036854775807n);

export const builderDraftInputSchema = z.strictObject({
  expectedRevision: revisionSchema,
  tree: z.custom<unknown>((value) => value !== undefined),
});

export const builderRevisionInputSchema = z.strictObject({
  expectedRevision: revisionSchema,
});

export const builderPublishInputSchema = builderRevisionInputSchema.extend({
  note: z.string().max(200).optional(),
});

export type BuilderDraftInput = z.infer<typeof builderDraftInputSchema>;
export type BuilderRevisionInput = z.infer<typeof builderRevisionInputSchema>;
export type BuilderPublishInput = z.infer<typeof builderPublishInputSchema>;
