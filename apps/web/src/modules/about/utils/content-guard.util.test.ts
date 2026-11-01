import { describe, expect, it } from 'vitest';
import type { PublicExperience, PublicSkill } from '@portfolio/contracts';

import { guardExperience, guardSkillGroups, guardSkills } from './content-guard.util';

const experience: PublicExperience = {
  id: 1,
  company: 'Studio',
  companyUrl: null,
  location: 'Hà Nội',
  employmentType: 'FULL_TIME',
  role: 'Engineer',
  summary: 'TODO: write summary',
  highlights: 'TBD',
  startDate: '2022-01-01',
  endDate: null,
  lang: 'en',
};

const skill: PublicSkill = {
  id: 1,
  name: 'React',
  slug: 'react',
  depth: 'DAILY',
  showInMarquee: true,
  category: { id: 1, name: 'TODO category', lang: 'en' },
  lang: 'en',
};

describe('public About mappers', () => {
  it('keeps experience entries and omits placeholder text fields', () => {
    expect(guardExperience([experience])).toEqual([{ ...experience, summary: '', highlights: '' }]);
  });

  it('keeps usable skills when a category label is unfinished', () => {
    expect(guardSkills([skill])[0]).toEqual({
      ...skill,
      category: { ...skill.category, name: '' },
    });
    expect(guardSkillGroups({ daily: [skill], shipped: [], growing: [] }).daily).toHaveLength(1);
  });

  it('does not render a skill with an unfinished required name', () => {
    expect(guardSkills([{ ...skill, name: 'TBD' }])).toEqual([]);
  });
});
