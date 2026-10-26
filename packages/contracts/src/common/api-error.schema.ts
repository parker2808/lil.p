import { z } from 'zod';

/**
 * Shared error body (PLAN D5). T10 fills in the remaining codes
 * and the request-id / fieldErrors fields.
 */
export const errorCodeSchema = z.enum([
  'NOT_SEEDED',
  'NOT_FOUND',
  'VALIDATION_FAILED',
  'CONFLICT',
  'STALE',
  'IN_USE',
  'BLOCK_NOT_ALLOWED',
  'BLOCK_LIMIT',
  'BLOCK_LOCKED',
  'BLOCK_REQUIRED',
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'FORBIDDEN',
  'BAD_ORIGIN',
  'RATE_LIMITED',
  'INTERNAL',
]);

export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: errorCodeSchema,
  message: z.string(),
  requestId: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
