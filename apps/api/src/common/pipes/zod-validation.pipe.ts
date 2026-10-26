import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

export function flattenZodError(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    fieldErrors[path] ??= [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

/**
 * Parse `@Query()`, `@Body()`, or `@Param()` with a contracts schema.
 * Failure → 400 `VALIDATION_FAILED` with `fieldErrors` keyed by path.
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: flattenZodError(parsed.error),
      });
    }
    return parsed.data;
  }
}
