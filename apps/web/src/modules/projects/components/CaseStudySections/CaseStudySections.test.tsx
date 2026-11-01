import { projectFixture } from '@portfolio/contracts';
import type { PublicProjectDetail } from '@portfolio/contracts';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/modules/content/components/Markdown/Markdown', () => ({ Markdown: () => null }));

import { caseStudyToc } from './CaseStudySections';

const labels = {
  summary: 'Summary',
  limits: 'Limits',
  scope: 'Scope',
  how: 'How',
  tradeoffs: 'Trade-offs',
  result: 'Result',
  retro: 'Retro',
  notMine: 'Not mine',
  released: 'Released',
  notReleased: 'Not released',
};

describe('caseStudyToc', () => {
  it('lists section h2s and titled decision h3s', () => {
    const project = {
      ...projectFixture,
      problem: 'Old path',
      constraints: '',
      approach: '',
      decisions: '### Query\nTanStack\n\n### Tokens\nShared',
      outcome: 'Shipped',
      lessons: '',
      notMine: null,
      releaseStatus: null,
    } as PublicProjectDetail;

    expect(caseStudyToc(project, labels)).toEqual([
      { id: 'summary', title: 'Summary', depth: 2 },
      { id: 'tradeoffs', title: 'Trade-offs', depth: 2 },
      { id: 'tradeoff-1', title: 'Query', depth: 3 },
      { id: 'tradeoff-2', title: 'Tokens', depth: 3 },
      { id: 'result', title: 'Result', depth: 2 },
    ]);
  });
});
