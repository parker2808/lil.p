import { projectFixtures } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { projectNeighbors, splitDecisions, splitLimitsAndScope } from './case-study.util';

describe('splitLimitsAndScope', () => {
  it('keeps plain constraints as limits', () => {
    expect(splitLimitsAndScope('No freeze.')).toEqual({ limits: 'No freeze.', scope: [] });
  });

  it('splits Functional / Non-functional into scope columns', () => {
    const source = `### Functional
Keep the contract

### Non-functional
Stay small`;
    expect(splitLimitsAndScope(source)).toEqual({
      limits: '',
      scope: [
        { title: 'Functional', items: ['Keep the contract'] },
        { title: 'Non-functional', items: ['Stay small'] },
      ],
    });
  });
});

describe('splitDecisions', () => {
  it('splits titled cards and keeps a single untitled body', () => {
    expect(splitDecisions('Tokens first.')).toEqual([{ title: '', body: 'Tokens first.' }]);
    expect(splitDecisions('### Query\nTanStack\n\n### Tokens\nShared')).toEqual([
      { title: 'Query', body: 'TanStack' },
      { title: 'Tokens', body: 'Shared' },
    ]);
  });
});

describe('projectNeighbors', () => {
  it('returns prev and next by list order', () => {
    const { prev, next } = projectNeighbors(projectFixtures, 'sample-nda');
    expect(prev?.slug).toBe('sample-migration');
    expect(next?.slug).toBe('sample-overflow');
  });

  it('wraps around so the first and last case studies get both links', () => {
    expect(projectNeighbors(projectFixtures, 'sample-migration').prev?.slug).toBe(
      'sample-overflow',
    );
    expect(projectNeighbors(projectFixtures, 'sample-overflow').next?.slug).toBe(
      'sample-migration',
    );
  });

  it('returns no neighbors for a single or unknown case study', () => {
    expect(projectNeighbors(projectFixtures.slice(0, 1), 'sample-migration')).toEqual({
      prev: null,
      next: null,
    });
    expect(projectNeighbors(projectFixtures, 'missing')).toEqual({ prev: null, next: null });
  });
});
