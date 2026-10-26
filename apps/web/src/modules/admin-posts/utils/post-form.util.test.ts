import { describe, expect, it } from 'vitest';

import {
  clampLines,
  emptyPostForm,
  postPublishLint,
  slugifyTitle,
  toPostCreateInput,
} from './post-form.util';

describe('post form utils', () => {
  it('slugifies a title', () => {
    expect(slugifyTitle('Vue to React')).toBe('vue-to-react');
  });

  it('clamps takeaways to five lines', () => {
    expect(clampLines('a\nb\nc\nd\ne\nf', 5)).toBe('a\nb\nc\nd\ne');
  });

  it('flags TODO in the body before save', () => {
    const lint = postPublishLint({ ...emptyPostForm(), bodyEn: 'TODO: finish this note' });
    expect(lint.ok).toBe(false);
    expect(lint.fieldErrors.bodyEn).toContain('Must not contain TODO');
  });

  it('drops editor-only fields from the create payload', () => {
    const input = toPostCreateInput({
      ...emptyPostForm(),
      id: 3,
      status: 'DRAFT',
      updatedAt: 'now',
    });
    expect(input).not.toHaveProperty('id');
    expect(input).not.toHaveProperty('status');
    expect(input).not.toHaveProperty('updatedAt');
  });
});
