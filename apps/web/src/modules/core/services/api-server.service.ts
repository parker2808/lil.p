import 'server-only';

import { type Locale, localeSchema } from '@portfolio/contracts';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { z } from 'zod';

import { PUBLIC_CACHE_TAG, PUBLIC_REVALIDATE_SECONDS } from '../constants/cache.constant';
import { apiErrorFromResponse } from '../utils/api-error.util';
import { guardPublicText } from '../utils/placeholder.util';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';

type ApiServerOptions<T> = {
  locale?: Locale;
  tags?: string[];
  schema?: z.ZodType<T>;
  withAuth?: boolean;
  method?: string;
  body?: unknown;
};

function apiUrl(path: string, locale?: Locale): URL {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, API_URL);
  if (locale) {
    // `[locale]` segments render in parallel with the layout's notFound(),
    // so unmatched paths like /favicon.ico still reach here.
    if (!localeSchema.safeParse(locale).success) {
      notFound();
    }
    url.searchParams.set('locale', locale);
  }
  return url;
}

/**
 * Public reads never touch cookies() or headers(), so `[locale]` pages stay
 * static/ISR. Every public fetch carries PUBLIC_CACHE_TAG, which admin saves expire.
 */
function publicInit(tags: string[] = []): RequestInit {
  const revalidate = process.env.NODE_ENV === 'production' ? PUBLIC_REVALIDATE_SECONDS : 0;
  return { method: 'GET', next: { revalidate, tags: [PUBLIC_CACHE_TAG, ...tags] } };
}

async function authInit(method: string | undefined, body: unknown): Promise<RequestInit> {
  const headers = new Headers();
  const token = (await cookies()).get('access_token')?.value;
  if (token) {
    headers.set('cookie', `access_token=${token}`);
  }
  if (body !== undefined) {
    headers.set('content-type', 'application/json');
  }
  return {
    method: method ?? 'GET',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  };
}

export async function apiServer<T>(path: string, options: ApiServerOptions<T> = {}): Promise<T> {
  const url = apiUrl(path, options.locale);
  const init = options.withAuth
    ? await authInit(options.method, options.body)
    : publicInit(options.tags);
  const response = await fetch(url, init);

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json: unknown = await response.json();
  const parsed = options.schema ? options.schema.parse(json) : (json as T);
  return path.startsWith('/api/public/') ? guardPublicText(parsed) : parsed;
}

/** Build-time probe: prerender only when the API answers, otherwise ISR fills pages on first visit. */
export async function isApiReachable(timeoutMs = 30_000): Promise<boolean> {
  try {
    const response = await fetch(apiUrl('/api/health'), {
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    return response.ok;
  } catch {
    return false;
  }
}
