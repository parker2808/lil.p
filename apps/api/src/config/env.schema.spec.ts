import { describe, expect, it } from 'vitest';

import { envSchema } from './env.schema';

const valid = {
  NODE_ENV: 'development',
  API_PORT: '4000',
  API_HOST: '127.0.0.1',
  WEB_ORIGIN: 'http://localhost:3000',
  DATABASE_URL: 'mysql://app:changeme@127.0.0.1:3306/portfolio',
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
});
