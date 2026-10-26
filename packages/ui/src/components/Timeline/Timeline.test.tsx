import { experienceFixtures } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { groupExperience } from './group-experience.util';
import { Timeline } from './Timeline';

const labels = { now: 'now', highlights: 'Highlights', fallback: 'EN' };

function mockMatchMedia(reduced = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('reduce') ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('groupExperience', () => {
  it('groups two roles at the same company', () => {
    const groups = groupExperience(experienceFixtures);
    const acme = groups.find((group) => group.company === 'Acme Platform');
    expect(acme?.items).toHaveLength(2);
  });
});

describe('Timeline', () => {
  it('renders one group with two roles and a now label', () => {
    mockMatchMedia();
    render(<Timeline items={experienceFixtures} pageLocale="en" labels={labels} />);
    expect(screen.getAllByText('Acme Platform')).toHaveLength(1);
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    expect(screen.getAllByText('Frontend Engineer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('now').length).toBeGreaterThan(0);
  });

  it('marks fallback rows with the EN badge', () => {
    mockMatchMedia();
    const items = experienceFixtures.map((item, index) =>
      index === 0 ? item : { ...item, lang: 'en' as const },
    );
    render(<Timeline items={items} pageLocale="vi" labels={labels} />);
    expect(screen.getAllByText('EN').length).toBeGreaterThan(0);
  });
});
