import { z } from 'zod';

/** URL / cache-tag form. Prisma stores the uppercase twin. */
export const corePageKeySchema = z.enum(['home', 'about', 'projects', 'notes', 'contact']);
export type CorePageKey = z.infer<typeof corePageKeySchema>;
export const pageKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export type PageKey = z.infer<typeof pageKeySchema>;

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

export const layoutPresetSchema = z.enum([
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'SPLIT_8_4',
  'SPLIT_4_8',
  'SPLIT_7_5',
]);
export type LayoutPreset = z.infer<typeof layoutPresetSchema>;

export const blockSurfaceSchema = z.enum(['PLAIN', 'BAND']);
export type BlockSurface = z.infer<typeof blockSurfaceSchema>;
