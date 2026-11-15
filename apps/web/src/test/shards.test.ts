import { describe, expect, it } from 'vitest';

import { assertPinnedSpecs, SHARD_COUNT, SPECS, specsForShard } from '../../e2e/shards';

describe('web E2E shard registry', () => {
  it('assigns every registered spec exactly once', () => {
    const assigned = Array.from({ length: SHARD_COUNT }, (_, index) =>
      specsForShard(String(index + 1)),
    );
    expect(assigned.every((specs) => specs.length > 0)).toBe(true);
    expect(assigned.flat().sort()).toEqual([...SPECS].sort());
  });

  it('rejects pins for missing specs or invalid shards', () => {
    expect(() => assertPinnedSpecs({ 'never-registered-e2e.spec.ts': 5 })).toThrow(
      'Pinned E2E spec is not registered: never-registered-e2e.spec.ts',
    );
    expect(() => assertPinnedSpecs({ [SPECS[0]]: SHARD_COUNT + 1 })).toThrow(
      `Pinned E2E shard must be 1..${SHARD_COUNT}`,
    );
    expect(() => assertPinnedSpecs({ [SPECS[0]]: 5 })).not.toThrow();
  });
});
