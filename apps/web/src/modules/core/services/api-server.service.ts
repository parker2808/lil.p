import 'server-only';

import type { Locale } from '@portfolio/contracts';
import { cookies } from 'next/headers';
import type { z } from 'zod';

import { apiErrorFromResponse } from '../utils/api-error.util';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';

export async function apiServer<T>(
  path: string,
  options: {
    locale?: Locale;
    tags?: string[];
    schema?: z.ZodType<T>;
    withAuth?: boolean;
    method?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, API_URL);
  if (options.locale) {
    url.searchParams.set('locale', options.locale);
  }

  const headers = new Headers();
  if (options.withAuth) {
    const jar = await cookies();
    const token = jar.get('access_token')?.value;
    if (token) {
      headers.set('cookie', `access_token=${token}`);
    }
  }
  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  const revalidate = options.withAuth ? 0 : process.env.NODE_ENV === 'production' ? 3600 : 0;
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.withAuth ? 'no-store' : undefined,
    next: options.withAuth ? undefined : { revalidate, tags: options.tags },
  });

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json: unknown = await response.json();
  return options.schema ? options.schema.parse(json) : (json as T);
}
