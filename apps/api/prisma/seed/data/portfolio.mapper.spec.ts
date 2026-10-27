import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildUnmappedNote,
  loadPortfolioData,
  mapContactTopics,
  mapExperience,
  mapProjects,
  mapSiteSettings,
  parseMonthDate,
  SITE_AVAILABILITY_FALLBACK,
  slugifyLabel,
} from './portfolio.mapper';

const here = dirname(fileURLToPath(import.meta.url));

describe('portfolio mapper', () => {
  const data = loadPortfolioData();

  it('parses month-only dates as the first day and leaves full dates intact', () => {
    expect(parseMonthDate('2026-07')?.toISOString()).toBe('2026-07-01T00:00:00.000Z');
    expect(parseMonthDate('2021-01-01')?.toISOString()).toBe('2021-01-01T00:00:00.000Z');
    expect(parseMonthDate(null)).toBeNull();
  });

  it('keeps email and phone placeholders and does not invent availability', () => {
    const site = mapSiteSettings(data);
    expect(site.contactEmail).toBe('<email>');
    expect(site.availability).toBe(SITE_AVAILABILITY_FALLBACK);
    expect(data.siteSettings.availability).toBe('TODO (OPEN | NOT_LOOKING | FREELANCE)');
    expect(data.profile.phone).toBe('<phone>');
  });

  it('keeps each project status from the data and keeps notMine / releaseStatus / TODO lessons', () => {
    const projects = mapProjects(data);
    expect(projects.map((project) => project.slug)).toEqual([
      'particula',
      'cfw-back-office-field-config',
      'cfw-sales-crm',
      'msp-advanced',
      'msp-app-expansion',
      'migration-data-tool',
      'lil-j-birthday-site',
      'ctrack-crystal',
      'lil-p',
    ]);
    expect(projects.every((project) => project.status === 'DRAFT')).toBe(true);
    expect(projects.every((project) => project.publishedAt === null)).toBe(true);

    const particula = projects.find((project) => project.slug === 'particula');
    expect(particula?.notMineEn).toMatch(/Tim Vu/);
    expect(particula?.notMineVi).toBeNull();
    expect(particula?.lessonsEn).toBe('TODO (Parker to write)');
    expect(particula?.isConfidential).toBe(true);

    const lilP = projects.find((project) => project.slug === 'lil-p');
    expect(lilP?.isConfidential).toBe(false);
    expect(lilP?.notMineVi).toMatch(/Tiptap/);
    expect(lilP?.repoUrl).toBe('https://github.com/parker2808/lil.p');

    const backOffice = projects.find((project) => project.slug === 'cfw-back-office-field-config');
    expect(backOffice?.releaseStatus).toEqual({
      released: ['#1223 YIMCMC-3734', '#1227 YIMCMC-3751', '#1208', '#1214', '#1215'],
      notReleased: ['YIMCMC-3836 / 3837 Update Data + rework prefill', 'TS -> JS conversion'],
    });
    expect(backOffice?.teamSize).toBeNull();
  });

  it('redacts git identity emails in the committed fixture', () => {
    const raw = readFileSync(resolve(here, 'portfolio-data.json'), 'utf8');
    expect(raw).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(raw).toContain('<email>');
    expect(raw).toContain('<phone>');
  });

  it('derives contact topic slugs from the English label', () => {
    expect(slugifyLabel('Just saying hi')).toBe('just-saying-hi');
    expect(mapContactTopics(data).map((topic) => topic.slug)).toEqual([
      'job-opportunity',
      'freelance-project',
      'just-saying-hi',
    ]);
  });

  it('keeps experience keys only as seed join keys', () => {
    expect(mapExperience(data).map((row) => row.key)).toEqual([
      'cmc-cfw',
      'kobizo',
      'cmc-samsung',
      'litgroup-fe',
      'litgroup-be',
    ]);
  });

  it('writes every unmapped field into the committed note', () => {
    const note = buildUnmappedNote(data);
    const committed = JSON.parse(
      readFileSync(resolve(here, 'portfolio-unmapped.json'), 'utf8'),
    ) as unknown;
    expect(note).toEqual(committed);
    expect(note.siteSettings.availability).toBe('TODO (OPEN | NOT_LOOKING | FREELANCE)');
    expect(note.pageSections.length).toBeGreaterThan(0);
    expect(note.gaps.length).toBeGreaterThan(0);
  });
});
