import { describe, expect, it } from 'vitest';

import { publishLint } from './publish-lint.util';

describe('publishLint', () => {
  it('passes clean English fields', () => {
    expect(publishLint({ titleEn: 'Vue to React', bodyEn: 'What transfers.' })).toEqual({
      ok: true,
      fieldErrors: {},
    });
  });

  it('rejects TODO in English fields', () => {
    const result = publishLint({ bodyEn: 'TODO: finish this note' });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.bodyEn).toContain('Must not contain TODO');
  });

  it('rejects lorem placeholder copy', () => {
    const result = publishLint({ excerptEn: 'Lorem ipsum dolor' });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.excerptEn).toContain('Must not contain placeholder copy');
  });

  it('rejects {{ template markers', () => {
    const result = publishLint({ titleEn: 'Hello {{name}}' });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.titleEn).toContain('Must not contain template placeholders');
  });
});
