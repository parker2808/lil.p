import { skillFixtures } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { groupSkillsByCategory, SkillGroup } from './SkillGroup';

afterEach(cleanup);

const testing = { id: 2, name: 'Testing', lang: 'en' as const };
const unnamed = { id: 3, name: '', lang: 'en' as const };
const [vue, nuxt] = skillFixtures;
const groups = {
  daily: [{ ...vue!, category: testing }, nuxt!],
  shipped: [{ ...vue!, slug: 'jira', name: 'Jira', depth: 'SHIPPED' as const, category: unnamed }],
  growing: [{ ...nuxt!, slug: 'react', name: 'React', depth: 'GROWING' as const }],
};

describe('groupSkillsByCategory', () => {
  it('groups by category id and keeps depth order inside a category', () => {
    expect(
      groupSkillsByCategory(groups).map((group) => [group.name, group.skills.map((s) => s.name)]),
    ).toEqual([
      ['Frontend', ['Nuxt', 'React']],
      ['Testing', ['Vue']],
      ['', ['Jira']],
    ]);
  });
});

describe('SkillGroup', () => {
  it('renders one heading per category as plain lists, not chips', () => {
    const { container } = render(<SkillGroup groups={groups} labels={{ other: 'Other' }} />);
    expect(screen.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'Frontend',
      'Testing',
      'Other',
    ]);
    expect(container.querySelector('[data-slot="badge"]')).toBeNull();
  });

  it('renders nothing without skills', () => {
    const { container } = render(
      <SkillGroup groups={{ daily: [], shipped: [], growing: [] }} labels={{ other: 'Other' }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
