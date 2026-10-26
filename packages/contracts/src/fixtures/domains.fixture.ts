import type { PublicDomain } from '../domains/domains.type';

export const domainFixture: PublicDomain = {
  id: 1,
  slug: 'sample-domain',
  name: 'Sample domain',
  description: 'A one-line description of the problem space.',
  hue: 'AMBER',
  iconKey: 'wallet',
  projectCount: 2,
  lang: 'en',
};

export const emptyDomainFixture: PublicDomain = {
  ...domainFixture,
  id: 2,
  slug: 'empty-domain',
  name: 'Empty domain',
  projectCount: 0,
};

export const domainFixtures: PublicDomain[] = [
  domainFixture,
  {
    ...domainFixture,
    id: 3,
    slug: 'blue-domain',
    name: 'Blue domain',
    hue: 'BLUE',
    iconKey: 'globe',
  },
  {
    ...domainFixture,
    id: 4,
    slug: 'violet-domain',
    name: 'Violet domain',
    hue: 'VIOLET',
    iconKey: 'shopping-bag',
    projectCount: 1,
  },
  {
    ...domainFixture,
    id: 5,
    slug: 'jade-domain',
    name: 'Jade domain',
    hue: 'JADE',
    iconKey: 'code-2',
    projectCount: 1,
  },
];
