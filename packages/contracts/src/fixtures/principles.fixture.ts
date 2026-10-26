import type { PublicPrinciple } from '../principles/principles.type';

export const principleFixtures: PublicPrinciple[] = [
  {
    id: 1,
    title: 'Migrate in slices',
    body: 'Ship one route at a time so the old app stays up.',
    iconKey: 'layers',
    lang: 'en',
  },
  {
    id: 2,
    title: 'Test the contract',
    body: 'Playwright against the API, not the pixels.',
    iconKey: 'file-check',
    lang: 'en',
  },
  {
    id: 3,
    title: 'Server state is not UI',
    body: 'The cache owns the server. Components own the view.',
    iconKey: 'database',
    lang: 'en',
  },
];
