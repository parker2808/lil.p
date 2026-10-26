import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  collectHits,
  findMarkers,
  formatHits,
  parseMysqlUrl,
  scanDatabase,
} from './check-placeholders.mjs';

test('findMarkers reports every seed placeholder', () => {
  assert.deepEqual(findMarkers('Write to <email> or <phone>'), ['<email>', '<phone>']);
  assert.deepEqual(findMarkers('Sample Lorem TODO case'), ['Sample', 'Lorem', 'TODO']);
  assert.deepEqual(findMarkers({ note: 'TODO later' }), ['TODO']);
  assert.deepEqual(findMarkers('clean copy'), []);
});

test('collectHits keeps table, id and column', () => {
  const hits = collectHits([{ id: 1, contactEmail: '<email>', siteName: 'ok' }], {
    table: 'site_settings',
    label: 'singleton',
  });
  assert.deepEqual(hits, [
    {
      table: 'site_settings',
      id: 1,
      column: 'contactEmail',
      marker: '<email>',
      label: 'singleton',
    },
  ]);
  assert.match(formatHits(hits)[0], /site_settings#1 contactEmail contains <email>/);
});

test('parseMysqlUrl reads host and database', () => {
  const user = 'app';
  const parsed = parseMysqlUrl(`mysql://${user}@127.0.0.1:3307/portfolio_test`);
  assert.equal(parsed.host, '127.0.0.1');
  assert.equal(parsed.port, 3307);
  assert.equal(parsed.database, 'portfolio_test');
  assert.equal(parsed.user, user);
  assert.equal(parsed.password, '');
});

test('scanDatabase ignores draft projects and flags published ones', async () => {
  const tables = {
    site_settings: [{ id: 1, siteName: 'Parker' }],
    profile: [{ id: 1, displayName: 'Parker', phone: null }],
    nav_item: [],
    social_link: [],
    contact_topic: [],
    experience: [],
    education: [],
    principle: [],
    process_step: [],
    profile_stat: [],
    project: [
      { id: 1, status: 'DRAFT', titleEn: 'TODO draft' },
      { id: 2, status: 'PUBLISHED', titleEn: 'TODO live' },
    ],
    post: [],
    page_block: [{ id: 9, props: { heading: 'Hello' } }],
    page_version: [{ id: 3, snapshot: [{ props: { kicker: 'Sample kicker' } }] }],
  };

  const conn = {
    query: async (sql) => {
      const table = sql.match(/FROM `(\w+)`/)?.[1];
      let rows = tables[table] ?? [];
      if (sql.includes("status = 'PUBLISHED'")) {
        rows = rows.filter((row) => row.status === 'PUBLISHED');
      }
      return rows;
    },
  };

  const hits = await scanDatabase(conn);
  assert.equal(
    hits.some((hit) => hit.table === 'project' && hit.id === 1),
    false,
  );
  assert.ok(hits.some((hit) => hit.table === 'project' && hit.id === 2 && hit.marker === 'TODO'));
  assert.ok(hits.some((hit) => hit.table === 'page_version' && hit.marker === 'Sample'));
});
