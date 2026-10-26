import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Locale as ContentLocale } from '@portfolio/contracts';
import type { Request } from 'express';

/**
 * `@Locale()` reads `?locale=` from the query string. Defaults to `en`.
 * T10 will parse this through the zod pipe so `fr` becomes 400.
 */
export const Locale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ContentLocale => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const raw = request.query['locale'];
    return raw === 'vi' ? 'vi' : 'en';
  },
);
