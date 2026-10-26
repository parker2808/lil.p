import type { PublicProjectListItem } from '../projects/projects.type';

const skills = [
  { name: 'Nuxt', slug: 'nuxt' },
  { name: 'Vue', slug: 'vue' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'TanStack Query', slug: 'tanstack-query' },
  { name: 'Prisma', slug: 'prisma' },
];

export const projectFixture: PublicProjectListItem = {
  id: 1,
  slug: 'sample-migration',
  title: 'Sample migration case',
  tagline: 'Move a storefront without a release freeze.',
  client: 'Sample client',
  isFeatured: true,
  isConfidential: false,
  startDate: '2024-01-01',
  endDate: null,
  versionFrom: 'v1',
  versionTo: 'v2',
  domain: {
    slug: 'sample-domain',
    name: 'Sample domain',
    hue: 'AMBER',
    iconKey: 'wallet',
    lang: 'en',
  },
  topMetric: {
    id: 1,
    label: 'Release freeze',
    before: 'yes',
    after: 'no',
    value: '0',
    lang: 'en',
  },
  factChips: ['Stack A → Stack B', '0 downtime', '6 months'],
  skills: skills.slice(0, 3),
  lang: 'en',
};

export const confidentialProjectFixture: PublicProjectListItem = {
  ...projectFixture,
  id: 2,
  slug: 'sample-nda',
  title: 'Confidential platform',
  tagline: 'Diagrams only for this engagement.',
  isConfidential: true,
  domain: {
    slug: 'enterprise',
    name: 'Enterprise',
    hue: 'BLUE',
    iconKey: 'building-2',
    lang: 'en',
  },
};

export const overflowProjectFixture: PublicProjectListItem = {
  ...projectFixture,
  id: 3,
  slug: 'sample-overflow',
  title: 'Wide chip overflow',
  skills,
  topMetric: null,
};

export const projectFixtures = [projectFixture, confidentialProjectFixture, overflowProjectFixture];
