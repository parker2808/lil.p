import { parseBlock } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { AI_AGENTS_BLOCK_KEY, applyOwnerCopy, withOwnerAboutBlocks } from './owner-copy.data';
import { pagesData } from './pages.data';
import {
  loadPortfolioData,
  mapDomains,
  mapExperience,
  mapProfile,
  mapProfileStats,
  mapProjects,
  mapSkills,
  overlayPageSectionTitles,
} from './portfolio.mapper';

const PRIVATE_NAMES =
  /Samsung|Central Food|Central Group|Particula|MSP|CFW|Ctrack|Migration Data Tool|Moody|Polygon|lil\.j|lil-j\.vercel|interview-senior-fe/;
const IDENTIFIERS = new Set(['slug', 'key', 'skillSlugs', 'domainSlug', 'experienceKey']);

function publicText(value: unknown): string {
  return JSON.stringify(value, (key, field: unknown) => (IDENTIFIERS.has(key) ? undefined : field));
}

describe('owner copy overlay', () => {
  const raw = loadPortfolioData();
  const data = applyOwnerCopy(raw);
  const pages = withOwnerAboutBlocks(
    overlayPageSectionTitles(structuredClone(pagesData) as typeof pagesData, data.pageSections),
  );
  const about = pages.find((page) => page.key === 'ABOUT')!;

  it('does not mutate the frozen source data', () => {
    expect(raw).toEqual(loadPortfolioData());
  });

  it('uses the approved headline, bio sections and language level', () => {
    const profile = mapProfile(data);
    expect(profile.headlineEn).toBe('I move products forward without breaking them.');
    expect(profile.headlineEn).toContain(profile.headlineAccentEn);
    expect(profile.headlineVi).toContain(profile.headlineAccentVi);
    expect(profile.bioEn).toMatch(/^I'm Parker, a frontend developer in Hanoi/);
    expect(profile.bioEn).toContain("## What I'm proud of");
    expect(profile.bioVi).toContain('## Cách mình làm việc');
    expect(profile.bioEn).not.toContain('Building with AI agents');
    expect(profile.languagesEn).toBe('Vietnamese (native), English (working proficiency)');
    expect(publicText(profile)).not.toMatch(/\bTODO\b/);
  });

  it('keeps three employers with the second CMC Global stint as its own entry', () => {
    const experience = mapExperience(data).sort((a, b) => a.sortOrder - b.sortOrder);
    expect(new Set(experience.map((item) => item.company))).toEqual(
      new Set(['CMC Global', 'Kobizo', 'LitGroup']),
    );
    expect(experience.map((item) => item.company)).toEqual([
      'CMC Global',
      'Kobizo',
      'CMC Global',
      'LitGroup',
      'LitGroup',
    ]);
    const [current, kobizo] = experience;
    expect(current!.startDate.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(current!.endDate).toBeNull();
    expect(current!.summaryEn).toContain('Fleet Platform');
    expect(current!.summaryEn).toContain('a Thai retail group');
    expect(kobizo!.endDate?.toISOString()).toBe('2025-12-01T00:00:00.000Z');
  });

  it('removes client and private project names from public fields', () => {
    const fields = [
      mapProfile(data),
      mapExperience(data),
      mapProjects(data),
      mapProfileStats(data),
      mapDomains(data),
      about,
    ];
    expect(publicText(fields)).not.toMatch(PRIVATE_NAMES);
  });

  it('renames projects, keeps slugs and drops links for repos that must stay unnamed', () => {
    const projects = new Map(mapProjects(data).map((project) => [project.slug, project]));
    expect(projects.get('particula')?.titleEn).toBe('Asset Rating Platform');
    expect(projects.get('msp-app-expansion')?.titleEn).toBe('Ticket Hub');
    expect(projects.get('msp-advanced')?.titleEn).toBe('Ops Console');
    expect(projects.get('migration-data-tool')?.titleEn).toBe('Store Migrator');
    expect(projects.get('ctrack-crystal')?.titleEn).toBe('Fleet Platform');
    expect(projects.get('interview-senior-fe')).toMatchObject({
      titleEn: 'Senior FE Interview Kit',
      liveUrl: null,
      repoUrl: null,
    });
    expect(projects.get('lil-j-birthday-site')).toMatchObject({
      titleEn: 'Birthday Story',
      client: 'Personal project',
      liveUrl: null,
      repoUrl: null,
    });
    expect(projects.get('lil-p')?.repoUrl).toBe('https://github.com/parker2808/lil.p');
  });

  it('adds the multi-agent skill', () => {
    expect(mapSkills(data)).toContainEqual(
      expect.objectContaining({ name: 'Multi-agent AI workflow', category: 'workflow' }),
    );
  });

  it('adds valid "Building with AI agents" and "Side projects" sections to About', () => {
    expect(about.blocks.map((block) => block.key)).toEqual([
      'intro',
      AI_AGENTS_BLOCK_KEY,
      'stats',
      'experience',
      'side-projects',
      'principles',
      'skills',
      'education',
      'cv',
    ]);
    expect(about.blocks.map((block) => block.sortOrder)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    for (const block of about.blocks) {
      const checked = parseBlock({ id: 0, ...block });
      expect(checked.ok, block.key).toBe(true);
    }
    const sideProjects = publicText(about.blocks.find((block) => block.key === 'side-projects'));
    expect(sideProjects).toContain(`(#${AI_AGENTS_BLOCK_KEY})`);
    expect(sideProjects).toContain('https://github.com/parker2808/lil.p');
    expect(sideProjects).not.toMatch(/ai-memory|github\.com\/parker2808\/(?!lil\.p\))/);
    expect(publicText(about)).not.toMatch(/\bTODO\b/);
  });
});
