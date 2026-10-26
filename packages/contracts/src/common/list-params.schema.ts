import { z } from 'zod';

export function listParamsSchema<const S extends readonly [string, ...string[]]>(sortValues: S) {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(sortValues).default(sortValues[0]),
    q: z.string().max(100).optional(),
  });
}

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
  });
}

export function parseSort(sort: string): { field: string; direction: 'asc' | 'desc' } {
  if (sort.startsWith('-')) {
    return { field: sort.slice(1), direction: 'desc' };
  }
  return { field: sort, direction: 'asc' };
}

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
