import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import en from '../../../../i18n/locales/en.json';
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
  it('walks every BLOCK_REGISTRY type without dropping fields', () => {
    for (const [type, definition] of Object.entries(BLOCK_REGISTRY)) {
      const fields = schemaToFields(definition.props);
      expect(fields.length, type).toBeGreaterThan(0);
      for (const field of fields) {
        expect(lookup(en, field.label), `${type}:${field.path}:${field.label}`).toEqual(
          expect.any(String),
        );
      }
    }
  });

  it('keeps the hero primary CTA label as a localized field', () => {
    const fields = schemaToFields(BLOCK_REGISTRY.hero.props);
    const cta = fields.find((field) => field.path === 'primaryCta.label');
    expect(cta?.kind).toBe('localized-text');
  });

  it('throws on an unknown schema node', () => {
    expect(() => schemaToFields(z.unknown() as never)).toThrow();
  });
});
