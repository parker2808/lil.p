import { z, type ZodType } from 'zod';

import { apiClient } from '@/modules/core/services/api-client.service';

export function createAdminEntityApi<T extends { id: number }>(path: string, schema: ZodType<T>) {
  const listSchema = z.array(schema);

  return {
    list(): Promise<T[]> {
      return apiClient<T[]>(path).then((data) => listSchema.parse(data));
    },
    get(id: number): Promise<T> {
      return apiClient<T>(`${path}/${id}`).then((data) => schema.parse(data));
    },
    create(body: unknown): Promise<T> {
      return apiClient<T>(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }).then((data) => schema.parse(data));
    },
    update(id: number, body: unknown): Promise<T> {
      return apiClient<T>(`${path}/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }).then((data) => schema.parse(data));
    },
    remove(id: number): Promise<T> {
      return apiClient<T>(`${path}/${id}`, { method: 'DELETE' }).then((data) => schema.parse(data));
    },
    reorder(ids: number[]): Promise<void> {
      return apiClient(`${path}/order`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      }).then(() => undefined);
    },
  };
}

export type AdminEntityApi<T extends { id: number }> = ReturnType<typeof createAdminEntityApi<T>>;
