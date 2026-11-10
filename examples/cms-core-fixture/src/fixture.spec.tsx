// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { createRegistry, isBlockAllowedOnPage } from '@parker2808/cms-core/contracts';
import {
  buildSnapshot,
  checkBlockLimit,
  checkH1Insert,
  migrateSnapshot,
  nextBlockKey,
  orderBlocks,
  readSnapshot,
} from '@parker2808/cms-core/engine';
import { schemaToFields } from '@parker2808/cms-core/react';
import { renderBlocks } from '@parker2808/cms-core/react/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import current from '../snapshots/current.json';
import future from '../snapshots/future-version.json';
import legacy from '../snapshots/legacy-missing-seo.json';
import unknown from '../snapshots/unknown-field.json';
import { App, routeFor } from './App';
import { block, copy, definitions, registry, sampleBlocks } from './content';
import { Editor } from './Editor';
import { PageBlocks } from './render';

const require = createRequire(import.meta.url);

describe('standalone built-package consumer', () => {
  it('resolves ESM/CJS public entries, without leaking the client directive into the server', () => {
    for (const entry of ['contracts', 'engine', 'react', 'react/server']) {
      expect(require(`@parker2808/cms-core/${entry}`)).toBeTruthy();
    }
    expect(typeof renderBlocks).toBe('function');
    const core = join(import.meta.dirname, '../../../packages/cms-core/dist');
    for (const extension of ['js', 'cjs']) {
      expect(readFileSync(join(core, `react.${extension}`), 'utf8')).toMatch(
        /^['"]use client['"];?/,
      );
      expect(readFileSync(join(core, `react/server.${extension}`), 'utf8')).not.toMatch(
        /use client|SchemaForm|useState|useEffect/,
      );
    }
  });

  it('keeps registry, policy, ordering and host mappings independent of portfolio modules', () => {
    expect(() => createRegistry([definitions[0], definitions[0]])).toThrow(/Duplicate/);
    expect(isBlockAllowedOnPage(registry.paragraph, 'another-page', ['sample'])).toBe(true);
    expect(checkBlockLimit(registry.heading, 1)?.code).toBe('BLOCK_LIMIT');
    expect(checkH1Insert(registry, 0, [{ type: 'heading', sortOrder: 0 }])?.code).toBe(
      'BLOCK_LOCKED',
    );
    expect(nextBlockKey('heading', ['heading', 'heading-2'])).toBe('heading-3');
    expect(orderBlocks([{ sortOrder: 2 }, { sortOrder: 1 }])).toEqual([
      { sortOrder: 1 },
      { sortOrder: 2 },
    ]);
    const files = readdirSync(join(import.meta.dirname), { recursive: true }).filter(
      (file) => /\.[jt]sx?$/.test(String(file)) && !String(file).endsWith('.spec.tsx'),
    );
    for (const name of files) {
      const source = readFileSync(join(import.meta.dirname, String(name)), 'utf8');
      expect(source).not.toMatch(
        /@portfolio\/|@\/modules\/|packages\/cms-core\/src|apps\/(web|api)|next-intl|@prisma/,
      );
    }
  });

  it('returns explicit rejection without changing unsupported source data', () => {
    for (const [input, reason] of [
      [legacy, 'INVALID_SNAPSHOT'],
      [future, 'FUTURE_VERSION'],
      [unknown, 'INVALID_BLOCK'],
    ] as const) {
      const before = JSON.stringify(input);
      expect(readSnapshot(input, registry)).toMatchObject({ ok: false, reason });
      expect(migrateSnapshot(input, registry)).toMatchObject({ ok: false, reason });
      expect(JSON.stringify(input)).toBe(before);
    }
    const futureBlock = { ...current, blocks: [{ ...current.blocks[0], schemaVersion: 99 }] };
    expect(readSnapshot(futureBlock, registry)).toMatchObject({
      ok: false,
      reason: 'FUTURE_VERSION',
      index: 0,
    });
    const missingType = { ...current, blocks: [{ ...current.blocks[0], type: 'not-installed' }] };
    expect(readSnapshot(missingType, registry)).toMatchObject({
      ok: false,
      reason: 'UNKNOWN_TYPE',
      index: 0,
    });
    const nestedOnly = { ...unknown, blocks: [{ ...unknown.blocks[0] }] };
    delete (nestedOnly.blocks[0] as { newBlockFlag?: boolean }).newBlockFlag;
    expect(readSnapshot(nestedOnly, registry)).toMatchObject({ ok: true, snapshot: nestedOnly });
    expect(migrateSnapshot(nestedOnly, registry)).toMatchObject({ ok: true, snapshot: nestedOnly });
    const accepted = readSnapshot(current, registry);
    expect(accepted).toMatchObject({ ok: true, snapshot: current });
    if (!accepted.ok) throw new Error('Current snapshot was rejected');
    expect(buildSnapshot(accepted.snapshot.seo, accepted.snapshot.blocks)).toEqual(current);
    expect(require('@parker2808/cms-core/engine').readSnapshot(unknown, registry)).toMatchObject({
      ok: false,
      reason: 'INVALID_BLOCK',
    });
  });

  it('localizes field names through a host resolver and keeps preview/public markup equal for valid blocks', () => {
    for (const locale of ['en', 'vi'] as const) {
      const fields = schemaToFields(registry.heading.props, {
        labelFor: () => copy[locale].heading,
      });
      expect(fields[0].label).toBe(copy[locale].heading);
      const blocks = sampleBlocks(locale);
      expect(renderToStaticMarkup(<PageBlocks locale={locale} blocks={blocks} />)).toBe(
        renderToStaticMarkup(<PageBlocks locale={locale} blocks={blocks} draft />),
      );
      expect(
        renderToStaticMarkup(
          <PageBlocks locale={locale} blocks={[block('heading', 1, 0, locale)]} />,
        ),
      ).toContain(
        copy[locale].name === 'Common ground'
          ? 'A quieter way to build'
          : 'Một cách tạo trang tinh gọn hơn',
      );
    }
    expect(() => schemaToFields(registry.heading.props, { labelFor: () => '' })).toThrow(
      /Missing localized/,
    );
  });

  it('shows draft-only unknown warnings without executing or stripping source props', () => {
    const unknownBlock = {
      ...sampleBlocks('en')[1],
      type: 'not-installed',
      props: { dangerous: '<script>alert(1)</script>' },
    };
    const publicMarkup = renderToStaticMarkup(<PageBlocks locale="en" blocks={[unknownBlock]} />);
    const draftMarkup = renderToStaticMarkup(
      <PageBlocks locale="en" blocks={[unknownBlock]} draft />,
    );
    expect(publicMarkup).not.toContain('dangerous');
    expect(draftMarkup).toContain(copy.en.unknownBlock);
    expect(draftMarkup).not.toContain('<script>');
    expect(unknownBlock.props.dangerous).toContain('<script>');
  });
});

describe('bilingual routes and keyboard', () => {
  it('recognizes only declared EN/VI paths and localizes metadata', () => {
    expect(routeFor('/vi/editor')).toEqual({ locale: 'vi', route: 'editor' });
    expect(routeFor('/en/unknown')).toEqual({ locale: 'en', route: 'unknown' });
    expect(routeFor('/vi/not-a-route')).toEqual({ locale: 'vi', route: 'not-found' });
    expect(routeFor('/fr/')).toEqual({ locale: 'en', route: 'not-found' });
    render(<App pathname="/vi/unknown" />);
    expect(document.title).toContain(copy.vi.unknown);
    expect(document.documentElement.lang).toBe('vi');
  });

  it('selects and reorders via keyboard, and exposes localized field labels', () => {
    render(<Editor locale="vi" />);
    const paragraph = screen.getByRole('button', { name: /2\. Đoạn văn/ });
    fireEvent.click(paragraph);
    paragraph.focus();
    fireEvent.keyDown(paragraph, { key: 'ArrowDown', altKey: true });
    expect(screen.getByRole('button', { name: /3\. Đoạn văn/ }).getAttribute('aria-current')).toBe(
      'true',
    );
    expect(screen.getByRole('heading', { name: copy.vi.fields })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /Đoạn văn.*VI/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: copy.vi.remove })).toBeTruthy();
  });
});
