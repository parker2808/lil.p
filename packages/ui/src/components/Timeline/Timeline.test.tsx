import { experienceFixtures } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { achievementItems, groupExperience } from './group-experience.util';
import { Timeline } from './Timeline';

const labels = { now: 'now', fallback: 'EN' };

afterEach(cleanup);

describe('groupExperience', () => {
  it('groups two adjacent roles at the same company', () => {
    const groups = groupExperience(experienceFixtures);
    const acme = groups.find((group) => group.company === 'Acme Platform');
    expect(acme?.items).toHaveLength(2);
  });

  it('starts a new entry when someone returns to an earlier company', () => {
    const [first, , other] = experienceFixtures;
    const groups = groupExperience([first!, other!, { ...first!, id: 9 }]);
    expect(groups.map((group) => group.company)).toEqual([
      'Acme Platform',
      'Contoso Commerce',
      'Acme Platform',
    ]);
  });

  it('keeps at most two achievements', () => {
    expect(achievementItems('- One\n- Two\n- Three')).toEqual(['One', 'Two']);
  });
});

describe('Timeline', () => {
  it('renders the year range in Mono and company and role in Sans', () => {
    const { container } = render(
      <Timeline items={experienceFixtures} pageLocale="en" labels={labels} />,
    );
    expect(screen.getAllByText('Acme Platform')).toHaveLength(1);
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    const years = container.querySelectorAll('[data-slot="timeline-years"]');
    expect(years[0]).toHaveTextContent('2021 — now');
    expect(years[0]).toHaveClass('font-mono');
    expect(screen.getByRole('heading', { name: 'Acme Platform' })).toHaveClass('font-sans');
  });

  it('lists achievements without an accordion', () => {
    const { container } = render(
      <Timeline items={experienceFixtures} pageLocale="en" labels={labels} />,
    );
    expect(screen.getByText('Vue 2 to Vue 3 in slices')).toBeVisible();
    expect(container.querySelector('[data-slot="accordion"]')).toBeNull();
    for (const list of Array.from(
      container.querySelectorAll('[data-slot="timeline-achievements"]'),
    )) {
      expect(list.querySelectorAll('li').length).toBeLessThanOrEqual(2);
    }
  });

  it('marks fallback rows with the EN badge', () => {
    const items = experienceFixtures.map((item, index) =>
      index === 0 ? item : { ...item, lang: 'en' as const },
    );
    render(<Timeline items={items} pageLocale="vi" labels={labels} />);
    expect(screen.getAllByText('EN').length).toBeGreaterThan(0);
  });
});
