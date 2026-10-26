import { z } from 'zod';

/**
 * Every value in `.env` arrives as a string. This schema turns
 * `API_PORT="4000"` into the number 4000 and stops boot if a value
 * is missing or the wrong shape — so we never debug a half-configured server.
 */
export const envSchema = z
  .object({
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
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
    ADMIN_EMAIL: z.string().optional(),
    ADMIN_NAME: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    WEB_INTERNAL_URL: z.url().optional(),
    REVALIDATE_SECRET: z.string().min(16).optional(),
    ANALYTICS_SALT_SECRET: z.string().min(16).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'Must differ from JWT_ACCESS_SECRET',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
