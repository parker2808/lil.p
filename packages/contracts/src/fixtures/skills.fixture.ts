import type { PublicSkill, PublicSkillChip } from '../skills/skills.type';

const category = { id: 1, name: 'Frontend', lang: 'en' as const };

export const skillFixtures: PublicSkill[] = [
  { id: 1, name: 'Vue', slug: 'vue', depth: 'DAILY', showInMarquee: true, category, lang: 'en' },
  { id: 2, name: 'Nuxt', slug: 'nuxt', depth: 'DAILY', showInMarquee: true, category, lang: 'en' },
  {
    id: 3,
    name: 'TypeScript',
    slug: 'typescript',
    depth: 'DAILY',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 4,
    name: 'TanStack Query',
    slug: 'tanstack-query',
    depth: 'DAILY',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 5,
    name: 'Playwright',
    slug: 'playwright',
    depth: 'DAILY',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 6,
    name: 'Vue 2',
    slug: 'vue-2',
    depth: 'SHIPPED',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 7,
    name: 'Flask',
    slug: 'flask',
    depth: 'SHIPPED',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 8,
    name: 'MySQL',
    slug: 'mysql',
    depth: 'SHIPPED',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 9,
    name: 'React',
    slug: 'react',
    depth: 'GROWING',
    showInMarquee: true,
    category,
    lang: 'en',
  },
  {
    id: 10,
    name: 'Next.js',
    slug: 'next',
    depth: 'GROWING',
    showInMarquee: true,
    category,
    lang: 'en',
  },
];

export const skillChipFixtures: PublicSkillChip[] = skillFixtures.map(({ name, slug }) => ({
  name,
  slug,
}));

export const skillsGroupedFixture = {
  daily: skillFixtures.filter((skill) => skill.depth === 'DAILY'),
  shipped: skillFixtures.filter((skill) => skill.depth === 'SHIPPED'),
  growing: skillFixtures.filter((skill) => skill.depth === 'GROWING'),
};
