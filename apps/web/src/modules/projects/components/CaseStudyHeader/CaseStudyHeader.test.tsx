import { confidentialProjectFixture, projectFixture } from '@portfolio/contracts';
import type { PublicProjectDetail } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { CaseStudyHeader } from './CaseStudyHeader';

const labels = { back: 'All case studies', nda: 'NDA', version: 'to' };

function detail(over: Partial<PublicProjectDetail> = {}): PublicProjectDetail {
  return {
    ...projectFixture,
    role: 'Frontend Engineer',
    teamSize: 5,
    liveUrl: 'https://example.com/live',
    repoUrl: 'https://example.com/repo',
    problem: 'Old path',
    constraints: 'No freeze',
    approach: 'Slice',
    decisions: 'Tokens first',
    outcome: 'Shipped',
    lessons: 'Keep the contract',
    notMine: null,
    releaseStatus: null,
    keyFacts: ['Zero downtime'],
    seoTitle: null,
    seoDescription: null,
    metrics: [],
    experience: null,
    ...over,
  };
}

describe('CaseStudyHeader', () => {
  it('shows the NDA pill and no live or repo text on a confidential case', () => {
    const project = detail({
      ...confidentialProjectFixture,
      liveUrl: null,
      repoUrl: null,
    });
    render(<CaseStudyHeader project={project} labels={labels} />);
    expect(screen.getByText('NDA')).toBeInTheDocument();
    expect(screen.queryByText('https://example.com/live')).toBeNull();
    expect(screen.queryByText('https://example.com/repo')).toBeNull();
  });
});
