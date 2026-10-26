import { describe, expect, it } from 'vitest';

import { envSchema } from './env.schema';

const valid = {
  NODE_ENV: 'development',
  API_PORT: '4000',
  API_HOST: '127.0.0.1',
  WEB_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'mysql://app:changeme@127.0.0.1:3306/portfolio',
  JWT_ACCESS_SECRET: 'test-access-secret-at-least-32-chars!!',
  JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-chars!',
};

describe('envSchema', () => {
  it('parses a valid env', () => {
    expect(envSchema.parse(valid)).toMatchObject({
      API_PORT: 4000,
      API_HOST: '127.0.0.1',
    });
  });

  it('rejects a non-numeric API_PORT', () => {
    expect(() => envSchema.parse({ ...valid, API_PORT: 'abc' })).toThrow(/API_PORT|invalid/i);
  });

  it('rejects a missing DATABASE_URL', () => {
    const rest = { ...valid, DATABASE_URL: undefined };
    expect(() => envSchema.parse(rest)).toThrow(/DATABASE_URL/i);
  });

  it('turns PRISMA_LOG_QUERIES=1 into true', () => {
    expect(envSchema.parse({ ...valid, PRISMA_LOG_QUERIES: '1' }).PRISMA_LOG_QUERIES).toBe(true);
    expect(envSchema.parse(valid).PRISMA_LOG_QUERIES).toBe(false);
  });

  it('rejects JWT secrets that are short or equal', () => {
    expect(() => envSchema.parse({ ...valid, JWT_ACCESS_SECRET: 'short' })).toThrow();
    expect(() =>
      envSchema.parse({
        ...valid,
        JWT_REFRESH_SECRET: valid.JWT_ACCESS_SECRET,
      }),
    ).toThrow(/differ/i);
  });
});
