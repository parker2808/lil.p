import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import en from '../../../../i18n/locales/en.json';
import vi from '../../../../i18n/locales/vi.json';
import { schemaToFields } from './schema-to-fields.util';

function lookup(messages: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

describe('schemaToFields', () => {
  for (const [locale, messages] of [
    ['en', en],
    ['vi', vi],
  ] as const) {
    it(`walks every block with ${locale} labels and no untranslated keys`, () => {
      for (const [type, definition] of Object.entries(BLOCK_REGISTRY)) {
        const fields = schemaToFields(definition.props, (path, key) => {
          const label = key ? lookup(messages, key) : undefined;
          expect(label, `${locale}:${type}:${path}:${key}`).toEqual(expect.any(String));
          return label as string;
        });
        expect(fields.length, type).toBeGreaterThan(0);
        for (const field of fields) {
          expect(field.label).not.toMatch(/^admin\./);
        }
      }
    });
  }

  it('keeps the hero primary CTA label as a localized field', () => {
    const fields = schemaToFields(BLOCK_REGISTRY.hero.props, (_, key) =>
      String(lookup(vi, key ?? '')),
    );
    const cta = fields.find((field) => field.path === 'primaryCta.label');
    expect(cta?.kind).toBe('localized-text');
    expect(cta?.label).toBe(lookup(vi, 'admin.blocks.hero.ctaLabel'));
    expect(cta?.label).not.toBe(lookup(en, 'admin.blocks.hero.ctaLabel'));
  });

  it('registers portfolio widget kinds in the host', () => {
    const labels = (_path: string, key: string | undefined) => key ?? 'Label';
    expect(
      schemaToFields(BLOCK_REGISTRY['featured-case'].props, labels).find(
        (field) => field.path === 'projectId',
      )?.kind,
    ).toBe('number');
    expect(
      schemaToFields(BLOCK_REGISTRY['case-grid'].props, labels).find(
        (field) => field.path === 'projectIds',
      )?.kind,
    ).toBe('array');
    expect(
      schemaToFields(BLOCK_REGISTRY['stat-band'].props, labels).find(
        (field) => field.path === 'statIds',
      )?.kind,
    ).toBe('array');
    expect(
      schemaToFields(BLOCK_REGISTRY['case-grid'].props, labels).find(
        (field) => field.path === 'domainSlug',
      )?.kind,
    ).toBe('tag');
  });

  it('throws on an unknown schema node', () => {
    expect(() => schemaToFields(z.unknown() as never, () => 'Label')).toThrow();
  });
});
