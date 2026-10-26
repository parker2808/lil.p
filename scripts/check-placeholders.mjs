#!/usr/bin/env node
/**
 * Production gate (T60). Connects with DATABASE_URL and fails when a live
 * row still has a seed placeholder (`<email>`, `<phone>`, `Sample`, `Lorem`,
 * `TODO`): singletons, always-public rows, published projects/posts, published
 * PageVersion snapshots, and PageBlock.props.
 */
import { Buffer } from 'node:buffer';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const MARKERS = ['<email>', '<phone>', 'Sample', 'Lorem', 'TODO'];

const SINGLETONS = [
  { table: 'site_settings', label: 'singleton' },
  { table: 'profile', label: 'singleton' },
];

const LIVE_PUBLIC = [
  { table: 'nav_item', label: 'live' },
  { table: 'social_link', label: 'live' },
  { table: 'contact_topic', label: 'live' },
  { table: 'experience', label: 'live' },
  { table: 'education', label: 'live' },
  { table: 'principle', label: 'live' },
  { table: 'process_step', label: 'live' },
  { table: 'profile_stat', label: 'live' },
];

export function findMarkers(value) {
  if (value == null) {
    return [];
  }
  let text;
  if (typeof value === 'string') {
    text = value;
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    text = value.toString('utf8');
  } else {
    text = JSON.stringify(value);
  }
  return MARKERS.filter((marker) => text.includes(marker));
}

export function collectHits(rows, { table, label, idKey = 'id' }) {
  const hits = [];
  for (const row of rows) {
    for (const [column, value] of Object.entries(row)) {
      for (const marker of findMarkers(value)) {
        hits.push({ table, id: row[idKey], column, marker, label });
      }
    }
  }
  return hits;
}

export function formatHits(hits) {
  return hits.map(
    (hit) => `${hit.table}#${hit.id} ${hit.column} contains ${hit.marker} (${hit.label})`,
  );
}

export function loadDotEnv(root = ROOT) {
  for (const relative of ['.env', 'apps/api/.env']) {
    const file = join(root, relative);
    if (!existsSync(file)) {
      continue;
    }
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) {
        continue;
      }
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

export function parseMysqlUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '').split('?')[0]),
  };
}

function loadMariadb() {
  const pnpm = join(ROOT, 'node_modules', '.pnpm');
  const entry = existsSync(pnpm)
    ? readdirSync(pnpm).find((name) => name.startsWith('mariadb@'))
    : undefined;
  if (!entry) {
    throw new Error('mariadb is not installed — run pnpm install at the repo root');
  }
  const require = createRequire(join(pnpm, entry, 'node_modules', 'mariadb', 'package.json'));
  return require('mariadb');
}

async function queryAll(conn, table, where = '') {
  return conn.query(`SELECT * FROM \`${table}\`${where ? ` WHERE ${where}` : ''}`);
}

export async function scanDatabase(conn) {
  const hits = [];

  for (const source of SINGLETONS) {
    hits.push(...collectHits(await queryAll(conn, source.table), source));
  }
  for (const source of LIVE_PUBLIC) {
    hits.push(...collectHits(await queryAll(conn, source.table), source));
  }

  hits.push(
    ...collectHits(await queryAll(conn, 'project', "status = 'PUBLISHED'"), {
      table: 'project',
      label: 'published',
    }),
  );
  hits.push(
    ...collectHits(await queryAll(conn, 'post', "status = 'PUBLISHED'"), {
      table: 'post',
      label: 'published',
    }),
  );
  hits.push(
    ...collectHits(await queryAll(conn, 'page_block'), {
      table: 'page_block',
      label: 'PageBlock.props',
    }),
  );
  hits.push(
    ...collectHits(await queryAll(conn, 'page_version'), {
      table: 'page_version',
      label: 'published snapshot',
    }),
  );

  return hits;
}

export async function runCheckPlaceholders({ url, connect } = {}) {
  const databaseUrl = url ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
  const cfg = parseMysqlUrl(databaseUrl);
  const mariadb = connect ? null : loadMariadb();
  const conn = connect
    ? await connect(cfg)
    : await mariadb.createConnection({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        allowPublicKeyRetrieval: true,
      });
  try {
    return await scanDatabase(conn);
  } finally {
    if (conn.end) {
      await conn.end();
    }
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  loadDotEnv();
  runCheckPlaceholders()
    .then((hits) => {
      if (hits.length > 0) {
        console.error(
          'check:placeholders failed:\n' +
            formatHits(hits)
              .map((l) => `  ${l}`)
              .join('\n'),
        );
        process.exit(1);
      }
      console.log('check:placeholders passed (0 live placeholder rows)');
    })
    .catch((error) => {
      console.error(`check:placeholders error: ${error.message}`);
      process.exit(2);
    });
}
