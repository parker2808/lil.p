import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const migrations = resolve(import.meta.dirname, '../../../prisma/migrations');
const historicalMigration = '20261027150000_portfolio_content';
const sql = readFileSync(join(migrations, historicalMigration, 'migration.sql'), 'utf8');
const seed = readFileSync(
  resolve(import.meta.dirname, '../../../prisma/seed/data/pages.data.ts'),
  'utf8',
);

describe('V17 pre-D2 tracked raw page inventory (not a production DB inventory)', () => {
  it('accounts for every migration that seeds page rows, blocks or versions', () => {
    const writers = readdirSync(migrations).filter((directory) => {
      if (!/^\d+_/.test(directory)) return false;
      const source = readFileSync(join(migrations, directory, 'migration.sql'), 'utf8');
      return /^INSERT INTO `page(?:_block|_version)?` /m.test(source);
    });
    expect(writers).toEqual([historicalMigration]);
    expect(sql.match(/^INSERT INTO `page` /gm)).toHaveLength(1);
    expect(sql.match(/^INSERT INTO `page_block` /gm)).toHaveLength(1);
    expect(sql.match(/^INSERT INTO `page_version` /gm)).toHaveLength(5);
    const snapshots = [...sql.matchAll(/^SELECT p\.id, 1, CAST\('((?:''|[^'])*)' AS JSON\)/gm)];
    expect(snapshots).toHaveLength(5);
    let blockCount = 0;
    for (const [, literal] of snapshots) {
      const raw = JSON.parse(literal.replaceAll("''", "'")) as {
        seo: Record<string, unknown>;
        blocks: Array<Record<string, unknown>>;
      };
      expect(Object.keys(raw).sort()).toEqual(['blocks', 'seo']);
      expect(Object.keys(raw.seo).sort()).toEqual([
        'seoDescriptionEn',
        'seoDescriptionVi',
        'seoTitleEn',
        'seoTitleVi',
      ]);
      blockCount += raw.blocks.length;
      for (const block of raw.blocks) {
        expect(Object.keys(block).sort()).toEqual([
          'isVisible',
          'key',
          'layout',
          'props',
          'schemaVersion',
          'sortOrder',
          'surface',
          'type',
        ]);
        expect(block.schemaVersion).toBe(1);
      }
    }
    expect(blockCount).toBe(22);
  });

  it('accounts for all five code-seeded pages and their unflattened legacy block rows', () => {
    expect([...seed.matchAll(/^ {4}key: '([A-Z]+)',/gm)].map((match) => match[1]).sort()).toEqual([
      'ABOUT',
      'CONTACT',
      'HOME',
      'NOTES',
      'PROJECTS',
    ]);
    expect(seed.match(/^ {8}type: '[a-z-]+',/gm)).toHaveLength(22);
    expect(seed.match(/^ {8}schemaVersion: 1,/gm)).toHaveLength(22);
    expect(seed).toMatch(
      /type: block\.type,\s+key: block\.key,\s+schemaVersion: block\.schemaVersion/,
    );
    expect(seed).toMatch(/const snapshot = \{\s+seo: \{/);
    expect(seed).toMatch(/blocks: page\.blocks\.map\(\(block\) => \(\{/);
    expect(seed).toMatch(/await prisma\.pageVersion\.create\(/);
  });
});
