import { describe, expect, it } from 'vitest';

import { parseBlock, resolveBlockLocale } from './resolve-block.util';

const heroRow = {
  id: 1,
  type: 'hero',
  key: 'hero',
  layout: 'SPLIT_7_5' as const,
  surface: 'PLAIN' as const,
  schemaVersion: 1,
  props: {
    primaryCta: { label: { en: 'View work', vi: 'Xem việc' }, href: '/projects' },
    showDiagram: true,
    showAvailability: true,
  },
};

describe('parseBlock', () => {
  it('accepts a valid hero', () => {
    const result = parseBlock(heroRow);
    expect(result.ok).toBe(true);
  });

  it('returns UNKNOWN_TYPE for a type not in the registry', () => {
    const result = parseBlock({ ...heroRow, type: 'not-a-block' });
    expect(result).toMatchObject({ ok: false, reason: 'UNKNOWN_TYPE' });
  });

  it('accepts a seeded case-grid', () => {
    const result = parseBlock({
      id: 2,
      type: 'case-grid',
      key: 'work',
      layout: 'THREE',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: {
        heading: { title: { en: 'Selected work', vi: 'Việc đã chọn' } },
        source: 'latest',
        projectIds: [],
        limit: 3,
      },
    });
    expect(result.ok).toBe(true);
  });

  it('returns INVALID_PROPS when required fields are missing', () => {
    const result = parseBlock({ ...heroRow, props: { showDiagram: true } });
    expect(result).toMatchObject({ ok: false, reason: 'INVALID_PROPS' });
  });

  it('migrates an older hero that stored `cta`', () => {
    const result = parseBlock({
      ...heroRow,
      schemaVersion: 0,
      props: {
        cta: { label: { en: 'View work', vi: '' }, href: '/projects' },
        showDiagram: true,
        showAvailability: false,
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.block.props).toMatchObject({
        primaryCta: { href: '/projects' },
      });
    }
  });
});

describe('resolveBlockLocale', () => {
  it('returns Vietnamese when every pair has a value', () => {
    const resolved = resolveBlockLocale(heroRow.props, 'vi');
    expect(resolved.lang).toBe('vi');
    expect(resolved.props).toMatchObject({
      primaryCta: { label: 'Xem việc', href: '/projects' },
    });
  });

  it('accepts a seeded notes-browser', () => {
    const result = parseBlock({
      id: 4,
      type: 'notes-browser',
      key: 'notes',
      layout: 'ONE',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: { showFeatured: true, pageSize: 10 },
    });
    expect(result.ok).toBe(true);
  });

  it('accepts a seeded projects-browser', () => {
    const result = parseBlock({
      id: 3,
      type: 'projects-browser',
      key: 'projects',
      layout: 'TWO',
      surface: 'PLAIN',
      schemaVersion: 1,
      props: { showFeatured: true, pageSize: 6 },
    });
    expect(result.ok).toBe(true);
  });

  it('falls back the whole block to English when one Vi value is missing', () => {
    const resolved = resolveBlockLocale(
      {
        ...heroRow.props,
        primaryCta: { label: { en: 'View work', vi: '' }, href: '/projects' },
      },
      'vi',
    );
    expect(resolved.lang).toBe('en');
    expect(resolved.props).toMatchObject({
      primaryCta: { label: 'View work' },
    });
  });
});
