import { z } from 'zod';

/** Compose interpolates unset secrets as `""`; treat those as missing. */
const emptyToUndefined = (value: unknown) =>
  value === '' || value === undefined || value === null ? undefined : value;

const optionalText = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalSecret = z.preprocess(emptyToUndefined, z.string().min(16).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.url().optional());

/**
 * Every value in `.env` arrives as a string. This schema turns
 * `API_PORT="4000"` into the number 4000 and stops boot if a value
 * is missing or the wrong shape — so we never debug a half-configured server.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.preprocess(
      (value) => (value === '' || value === undefined || value === null ? process.env.PORT : value),
      z.coerce.number().int().positive(),
    ),
    API_HOST: z.string().min(1).default('127.0.0.1'),
    WEB_ORIGIN: z.url(),
    DATABASE_URL: z.string().min(1).startsWith('mysql://'),
    CROSS_SITE_COOKIES: z
      .string()
      .optional()
      .transform((value) => value === '1' || value === 'true'),
    COOKIE_DOMAIN: optionalText,
    CORS_ORIGINS: optionalText,
    DATABASE_URL_TEST: z.preprocess(
      emptyToUndefined,
      z.string().min(1).startsWith('mysql://').optional(),
    ),
    PRISMA_LOG_QUERIES: z
      .string()
      .optional()
      .transform((value) => value === '1' || value === 'true'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
    ADMIN_EMAIL: optionalText,
    ADMIN_NAME: optionalText,
    ADMIN_PASSWORD: optionalText,
    CLOUDINARY_CLOUD_NAME: optionalText,
    CLOUDINARY_API_KEY: optionalText,
    CLOUDINARY_API_SECRET: optionalText,
    WEB_INTERNAL_URL: optionalUrl,
    REVALIDATE_SECRET: optionalSecret,
    ANALYTICS_SALT_SECRET: optionalSecret,
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
