import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { listParamsSchema, paginatedSchema, parseSort } from './list-params.schema';

const schema = listParamsSchema(['-publishedAt', 'publishedAt', '-id']);

describe('listParamsSchema', () => {
  it('defaults page and pageSize', () => {
    expect(schema.parse({})).toMatchObject({ page: 1, pageSize: 20, sort: '-publishedAt' });
  });

  it('rejects pageSize above 100', () => {
    const result = schema.safeParse({ pageSize: '500' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'pageSize')).toBe(true);
    }
  });
});

describe('parseSort', () => {
  it('reads a leading minus as desc', () => {
    expect(parseSort('-publishedAt')).toEqual({ field: 'publishedAt', direction: 'desc' });
    expect(parseSort('title')).toEqual({ field: 'title', direction: 'asc' });
  });
});

describe('paginatedSchema', () => {
  it('wraps an item schema', () => {
    const page = paginatedSchema(z.object({ id: z.number() }));
    expect(page.parse({ items: [{ id: 1 }], page: 1, pageSize: 1, total: 1 }).total).toBe(1);
  });
});
