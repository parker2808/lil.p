import { z } from 'zod';

/**
 * Every value in `.env` arrives as a string. This schema turns
 * `API_PORT="4000"` into the number 4000 and stops boot if a value
 * is missing or the wrong shape — so we never debug a half-configured server.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive(),
  API_HOST: z.string().min(1).default('127.0.0.1'),
  WEB_ORIGIN: z.url(),
  DATABASE_URL: z.string().min(1).startsWith('mysql://'),
  DATABASE_URL_TEST: z.string().min(1).startsWith('mysql://').optional(),
  PRISMA_LOG_QUERIES: z
    .string()
    .optional()
    .transform((value) => value === '1' || value === 'true'),
});

export type Env = z.infer<typeof envSchema>;
