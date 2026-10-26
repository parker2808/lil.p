import { describe, expect, it } from 'vitest';

import { contactSchema } from './contact.schema';

describe('contactSchema', () => {
  it('defaults honeypot and locale', () => {
    expect(
      contactSchema.parse({
        name: 'Ana',
        email: ['visitor', 'example.com'].join('@'),
        message: 'Hello from the form',
      }),
    ).toMatchObject({ website: '', locale: 'en' });
  });

  it('rejects a message over 2000 characters', () => {
    const parsed = contactSchema.safeParse({
      name: 'Ana',
      email: ['visitor', 'example.com'].join('@'),
      message: 'x'.repeat(2001),
    });
    expect(parsed.success).toBe(false);
  });
});
