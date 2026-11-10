import {
  type BlockSurface,
  blockSurfaceSchema,
  type LayoutPreset,
  layoutPresetSchema,
  type PageKey,
  pageKeySchema,
} from '@parker2808/cms-core/contracts';
import { z } from 'zod';

/** URL / cache-tag form. Prisma stores the uppercase twin. */
export const corePageKeySchema = z.enum(['home', 'about', 'projects', 'notes', 'contact']);
export type CorePageKey = z.infer<typeof corePageKeySchema>;
export { blockSurfaceSchema, layoutPresetSchema, pageKeySchema };
export type { BlockSurface, LayoutPreset, PageKey };

export const prismaPageKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/);
export type PrismaPageKey = z.infer<typeof prismaPageKeySchema>;

export const PAGE_KEY_TO_PRISMA: Record<CorePageKey, PrismaPageKey> = {
  home: 'HOME',
  about: 'ABOUT',
  projects: 'PROJECTS',
  notes: 'NOTES',
  contact: 'CONTACT',
};

export const PRISMA_PAGE_KEY_TO_PUBLIC: Record<string, PageKey> = {
  HOME: 'home',
  ABOUT: 'about',
  PROJECTS: 'projects',
  NOTES: 'notes',
  CONTACT: 'contact',
};

/** Locale-agnostic public path for each page key (`/` for home). */
export const PAGE_PUBLIC_PATHS: Record<CorePageKey, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  notes: '/notes',
  contact: '/contact',
};

/** One-segment paths owned by static public routes or the site's route machinery. */
export const RESERVED_PUBLIC_PAGE_SLUGS = [
  'home',
  'index',
  'about',
  'projects',
  'notes',
  'contact',
  'craft',
  'r3-loading-test',
  'r3-site-error-test',
  'rss',
  'api',
  'admin',
  'login',
  'icon',
  'apple-icon',
  'favicon',
  'robots',
  'sitemap',
  'manifest',
  'opengraph-image',
  'not-found',
  'error',
] as const;

export function isReservedPublicPageSlug(key: string): boolean {
  return (RESERVED_PUBLIC_PAGE_SLUGS as readonly string[]).includes(key);
}

export function toPrismaPageKey(key: PageKey): PrismaPageKey {
  return key.toUpperCase();
}
export function fromPrismaPageKey(key: PrismaPageKey): PageKey {
  return key.toLowerCase();
}
export function publicPagePathForKey(key: PageKey): string {
  return corePageKeySchema.safeParse(key).success
    ? PAGE_PUBLIC_PATHS[key as CorePageKey]
    : `/${key}`;
}
