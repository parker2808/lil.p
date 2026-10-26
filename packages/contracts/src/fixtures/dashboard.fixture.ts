import type { AdminHealth, AdminStats } from '../dashboard/dashboard.type';

export const adminStatsFixture: AdminStats = {
  range: '30d',
  projects: {
    draft: 2,
    published: 1,
    archived: 0,
    publishedInRange: 1,
    publishedInPrevious: 0,
  },
  posts: {
    draft: 1,
    published: 2,
    archived: 0,
    publishedInRange: 2,
    publishedInPrevious: 1,
  },
  messages: { unread: 3 },
};

export const adminHealthFixture: AdminHealth = {
  summary: {
    drafts: 3,
    missingVi: 1,
    noDomain: 1,
    fewKeyFacts: 1,
    marqueeCount: 2,
    publishLint: 1,
    missingAlt: 0,
    neverPublished: 0,
    staleDrafts: 0,
    invalidPageBlocks: 0,
    brokenRefs: 0,
  },
  issues: [
    {
      kind: 'PROJECT_NO_DOMAIN',
      entity: 'project',
      id: 11,
      title: 'Sample case',
      href: '/admin/projects/11',
    },
    {
      kind: 'CASE_STUDY_KEY_FACTS',
      entity: 'project',
      id: 11,
      title: 'Sample case',
      href: '/admin/projects/11',
      count: 1,
    },
    {
      kind: 'MISSING_VI',
      entity: 'project',
      id: 11,
      title: 'Sample case',
      href: '/admin/projects/11',
      fields: ['titleVi', 'taglineVi'],
    },
    {
      kind: 'PUBLISH_LINT',
      entity: 'post',
      id: 4,
      title: 'Draft note',
      href: '/admin/posts/4',
      fields: ['bodyEn'],
    },
    {
      kind: 'MARQUEE_SKILLS',
      entity: 'skill',
      id: null,
      title: '',
      href: '/admin/skills',
      count: 2,
    },
  ],
};
