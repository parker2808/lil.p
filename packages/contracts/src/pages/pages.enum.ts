import { z } from 'zod';

/** URL / cache-tag form. Prisma stores the uppercase twin. */
export const pageKeySchema = z.enum(['home', 'about', 'projects', 'notes', 'contact']);
export type PageKey = z.infer<typeof pageKeySchema>;

export const prismaPageKeySchema = z.enum(['HOME', 'ABOUT', 'PROJECTS', 'NOTES', 'CONTACT']);
export type PrismaPageKey = z.infer<typeof prismaPageKeySchema>;

export const PAGE_KEY_TO_PRISMA: Record<PageKey, PrismaPageKey> = {
  home: 'HOME',
  about: 'ABOUT',
  projects: 'PROJECTS',
  notes: 'NOTES',
  contact: 'CONTACT',
};

export const PRISMA_PAGE_KEY_TO_PUBLIC: Record<PrismaPageKey, PageKey> = {
  HOME: 'home',
  ABOUT: 'about',
  PROJECTS: 'projects',
  NOTES: 'notes',
  CONTACT: 'contact',
};

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
