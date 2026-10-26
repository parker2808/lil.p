import 'server-only';

import type { Locale } from '@portfolio/contracts';
import type { z } from 'zod';

import { apiErrorFromResponse } from '../utils/api-error.util';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';

export async function apiServer<T>(
  path: string,
  options: {
    locale?: Locale;
    tags?: string[];
    schema?: z.ZodType<T>;
  } = {},
): Promise<T> {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, API_URL);
  if (options.locale) {
    url.searchParams.set('locale', options.locale);
  }

  const revalidate = process.env.NODE_ENV === 'production' ? 3600 : 0;
  const response = await fetch(url, {
    next: { revalidate, tags: options.tags },
  });

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  const json: unknown = await response.json();
  return options.schema ? options.schema.parse(json) : (json as T);
}
