import { beforeEach, describe, expect, it } from 'vitest';

import { readRecovery, recoveryKey, writeRecovery } from './recovery';

const tree = {
  schemaVersion: 1 as const,
  root: { id: 'page', type: 'page' as const, responsive: { base: {} }, sections: [] },
};

describe('page/user-scoped recovery', () => {
  beforeEach(() => localStorage.clear());

  it('keeps a valid unsaved tree only for its owner and page', () => {
    const key = recoveryKey(3, 'example');
    expect(writeRecovery(key, tree)).toBe(true);
    expect(readRecovery(key)).toEqual(tree);
    expect(readRecovery(recoveryKey(4, 'example'))).toBeUndefined();
    expect(readRecovery(recoveryKey(3, 'other'))).toBeUndefined();
  });

  it('rejects old and invalid recovery data instead of silently loading it', () => {
    const key = recoveryKey(3, 'example');
    localStorage.setItem(key, JSON.stringify({ at: Date.now() - 25 * 60 * 60 * 1000, tree }));
    expect(readRecovery(key)).toBeUndefined();
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), tree: { missing: true } }));
    expect(readRecovery(key)).toBeUndefined();
  });
});
