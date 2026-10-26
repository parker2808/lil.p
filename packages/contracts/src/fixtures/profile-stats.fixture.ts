import type { PublicProfileStat } from '../profile-stats/profile-stats.type';

export const profileStatFixtures: PublicProfileStat[] = [
  {
    id: 1,
    label: 'Years shipping',
    value: '5',
    suffix: '+',
    source: 'YEARS_COMPUTED',
    iconKey: 'calendar',
    lang: 'en',
  },
  {
    id: 2,
    label: 'Products shipped',
    value: '4',
    suffix: null,
    source: 'PROJECT_COUNT',
    iconKey: 'boxes',
    lang: 'en',
  },
  {
    id: 3,
    label: 'Migrations',
    value: '2',
    suffix: null,
    source: 'MANUAL',
    iconKey: 'route',
    lang: 'en',
  },
  {
    id: 4,
    label: 'Asset classes',
    value: '20',
    suffix: '+',
    source: 'MANUAL',
    iconKey: 'layers',
    lang: 'en',
  },
];
