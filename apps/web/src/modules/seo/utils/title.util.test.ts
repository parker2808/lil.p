import { describe, expect, it } from 'vitest';
import { formatTitle } from './title.util';

describe('public title', () => {
  it('deduplicates the site name as a complete title segment', () => {
    expect(formatTitle('Parker Vu · Senior Frontend Engineer', 'Parker Vu')).toBe(
      'Parker Vu · Senior Frontend Engineer',
    );
    expect(formatTitle('About', 'Parker Vu')).toBe('About · Parker Vu');
    expect(formatTitle('Parker Vue migration', 'Parker Vu')).toBe(
      'Parker Vue migration · Parker Vu',
    );
  });
});
