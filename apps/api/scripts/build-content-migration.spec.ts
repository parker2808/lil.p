import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { loadPortfolioData, mapProjects } from '../prisma/seed/data/portfolio.mapper';
import {
  assertCommittedMigrationMatches,
  buildContentMigration,
  MIGRATION_SQL_PATH,
  splitSqlStatements,
} from './build-content-migration';

describe('build-content-migration', () => {
  const { sql, counts } = buildContentMigration();

  it('emits idempotent TiDB-safe inserts and never touches users', () => {
    expect(sql).toContain('INSERT INTO `site_settings`');
    expect(sql).toContain('ON DUPLICATE KEY UPDATE');
    expect(sql).toContain('INSERT INTO `project`');
    expect(sql).toMatch(/`status`,/);
    expect(sql).toContain("'DRAFT'");
    expect(sql).toContain("'lil-p'");
    expect(sql).toContain("'lil-j-birthday-site'");
    expect(sql).toContain("'ctrack-crystal'");
    expect(sql).toContain("'interview-senior-fe'");
    expect(sql).not.toContain('interview-fe-data');
    expect(sql.toLowerCase()).not.toContain('delete from `user`');
    expect(sql.toLowerCase()).not.toContain('truncate');
    expect(sql.toLowerCase()).not.toContain('drop table');
    expect(sql).not.toMatch(/create\s+fulltext/i);
    expect(sql).not.toContain('<email>@');
    expect(sql).toContain("'<email>'");
    expect(sql).toContain("'<phone>'");
  });

  it('keeps confidential flags and draft status from the JSON', () => {
    const projects = mapProjects(loadPortfolioData());
    expect(projects).toHaveLength(counts.project);
    expect(
      projects.filter((project) => project.isConfidential).map((project) => project.slug),
    ).toEqual([
      'particula',
      'cfw-back-office-field-config',
      'cfw-sales-crm',
      'msp-advanced',
      'msp-app-expansion',
      'migration-data-tool',
      'ctrack-crystal',
    ]);
    expect(
      projects.filter((project) => !project.isConfidential).map((project) => project.slug),
    ).toEqual(['lil-j-birthday-site', 'interview-senior-fe', 'lil-p']);
    const interview = projects.find((project) => project.slug === 'interview-senior-fe');
    expect(interview?.repoUrl).toBeNull();
    expect(interview?.status).toBe('DRAFT');
    expect(interview?.decisionsEn).toMatch(/NOT shipped/i);
    expect(projects.every((project) => project.status === 'DRAFT')).toBe(true);
  });

  it('splits statements without breaking quoted JSON', () => {
    const statements = splitSqlStatements(sql);
    expect(statements.length).toBeGreaterThan(20);
    expect(statements.every((statement) => statement.length > 0)).toBe(true);
    expect(statements.some((statement) => statement.startsWith('INSERT INTO `project`'))).toBe(
      true,
    );
  });

  it('matches the committed Prisma migration SQL', () => {
    assertCommittedMigrationMatches();
    const committed = readFileSync(MIGRATION_SQL_PATH, 'utf8');
    expect(committed).toBe(sql);
  });

  it('declares the expected row counts', () => {
    expect(counts).toMatchObject({
      site_settings: 1,
      profile: 1,
      nav_item: 5,
      social_link: 3,
      contact_topic: 3,
      skill_category: 5,
      experience: 5,
      education: 1,
      principle: 3,
      profile_stat: 4,
      process_step: 5,
      domain: 4,
      project: 10,
      page: 5,
    });
    expect(counts.skill).toBeGreaterThan(20);
    expect(counts.page_block).toBeGreaterThan(10);
    expect(counts.project_metric).toBeGreaterThan(8);
  });
});
