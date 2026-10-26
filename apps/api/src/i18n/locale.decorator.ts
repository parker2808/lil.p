import { Query } from '@nestjs/common';
import { localeQuerySchema } from '@portfolio/contracts';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

/**
 * `@Locale()` reads `?locale=` through the T10 zod pipe (default `en`).
 * `?locale=fr` → 400 `fieldErrors.locale`.
 */
export const Locale = () =>
  Query(new ZodValidationPipe(localeQuerySchema.transform((query) => query.locale)));
