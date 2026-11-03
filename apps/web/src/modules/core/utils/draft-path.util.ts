import { isReservedPublicPageSlug, pageKeySchema } from '@portfolio/contracts';

const PUBLIC_PATH = /^\/(en|vi)(?:\/(about|projects(?:\/[\w-]+)?|notes(?:\/[\w-]+)?|contact))?\/?$/;

export function safeDraftPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://')) {
    return '/en';
  }
  if (PUBLIC_PATH.test(value)) return value;
  const custom = /^\/(en|vi)\/([^/]+)\/?$/.exec(value);
  if (
    custom &&
    pageKeySchema.safeParse(custom[2]).success &&
    !isReservedPublicPageSlug(custom[2]!)
  ) {
    return value;
  }
  return '/en';
}
