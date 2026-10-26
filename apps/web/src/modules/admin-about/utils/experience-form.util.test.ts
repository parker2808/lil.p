import { describe, expect, it } from 'vitest';

import { emptyExperienceForm, toExperienceCreateInput } from './experience-form.util';

describe('experience form utils', () => {
  it('drops editor-only fields from the create payload', () => {
    const input = toExperienceCreateInput({
      ...emptyExperienceForm(),
      id: 4,
      updatedAt: 'now',
    });
    expect(input).not.toHaveProperty('id');
    expect(input).not.toHaveProperty('updatedAt');
    expect(input.employmentType).toBe('FULL_TIME');
  });
});
