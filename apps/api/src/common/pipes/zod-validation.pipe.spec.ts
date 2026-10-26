import { BadRequestException } from '@nestjs/common';
import { localeQuerySchema } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(localeQuerySchema);

  it('passes a valid locale through', () => {
    expect(pipe.transform({ locale: 'vi' })).toEqual({ locale: 'vi' });
  });

  it('defaults a missing locale to en', () => {
    expect(pipe.transform({})).toEqual({ locale: 'en' });
  });

  it('throws 400 with fieldErrors.locale for an unknown locale', () => {
    try {
      pipe.transform({ locale: 'fr' });
      throw new Error('expected pipe to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse() as {
        code: string;
        fieldErrors: Record<string, string[]>;
      };
      expect(body.code).toBe('VALIDATION_FAILED');
      expect(body.fieldErrors.locale).toBeDefined();
    }
  });
});
