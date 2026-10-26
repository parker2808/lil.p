import type { PublicProjectDetail, PublicSite } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { projectMetadata } from './project-metadata.util';

function sampleSite(): PublicSite {
  return {
    settings: {
      siteName: 'Parker',
      domain: 'example.test',
      defaultLocale: 'en',
      seoTitle: 'Site title',
      seoDescription: 'Site description',
      footerNote: '',
      contactIntro: '',
      replyTimeNote: '',
      contactEmail: '<email>',
      availability: 'OPEN',
      availabilityNote: '',
      analyticsEnabled: false,
      ambientEffects: false,
      marqueeEnabled: false,
      lang: 'en',
    },
    profile: {
      displayName: 'Parker',
      legalName: 'Parker',
      city: 'Hanoi',
      country: 'Vietnam',
      timezone: 'Asia/Ho_Chi_Minh',
      careerStartDate: '2018-01-01',
      headline: 'Frontend engineer',
      subheadline: '',
      bio: '',
      languages: 'English',
      heroKicker: null,
      headlineAccent: null,
      resumeEnId: null,
      resumeViId: null,
      lang: 'en',
    },
    nav: { header: [], footer: [] },
    socialLinks: [],
    profileStats: [],
  };
}

function sampleProject(over: Partial<PublicProjectDetail> = {}): PublicProjectDetail {
  return {
    id: 1,
    slug: 'live-case',
    title: 'Live case',
    tagline: 'A short tagline',
    client: 'Client',
    isFeatured: false,
    isConfidential: false,
    startDate: '2024-01-01',
    endDate: null,
    versionFrom: 'v1',
    versionTo: 'v2',
    domain: null,
    topMetric: null,
    factChips: [],
    skills: [],
    lang: 'en',
    role: 'Engineer',
    teamSize: null,
    liveUrl: null,
    repoUrl: null,
    problem: 'Problem',
    constraints: '',
    approach: '',
    decisions: '',
    outcome: '',
    lessons: '',
    notMine: null,
    releaseStatus: null,
    keyFacts: [],
    seoTitle: null,
    seoDescription: null,
    metrics: [],
    experience: null,
    ...over,
  };
}

describe('projectMetadata', () => {
  it('uses seo fields, then title/tagline, then SiteSettings', () => {
    const site = sampleSite();
    const fromFields = projectMetadata({
      site,
      project: sampleProject(),
      locale: 'en',
    });
    expect(fromFields.title).toBe('Live case · Parker');
    expect(fromFields.description).toBe('A short tagline');

    const fromSeo = projectMetadata({
      site,
      project: sampleProject({ seoTitle: 'SEO case', seoDescription: 'SEO desc' }),
      locale: 'en',
    });
    expect(fromSeo.title).toBe('SEO case · Parker');
    expect(fromSeo.description).toBe('SEO desc');
    expect(fromSeo.alternates?.canonical).toBe('http://localhost:3000/en/projects/live-case');
  });
});
