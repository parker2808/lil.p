import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy } from './csp.util';

describe('buildContentSecurityPolicy', () => {
  it('embeds the nonce and keeps frame-ancestors self', () => {
    const csp = buildContentSecurityPolicy('abc123');
    expect(csp).toContain("'nonce-abc123'");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).not.toContain("frame-ancestors 'none'");
    expect(csp).toContain('https://res.cloudinary.com');
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('adds a cross-origin API to connect-src', () => {
    const csp = buildContentSecurityPolicy('n', ['https://api.example.test']);
    expect(csp).toContain("connect-src 'self' https://api.example.test");
  });

  it('falls back to inline scripts without a nonce and keeps every other directive', () => {
    const extra = ['https://api.example.test'];
    const nonced = buildContentSecurityPolicy('n', extra).split('; ');
    const open = buildContentSecurityPolicy(undefined, extra).split('; ');

    expect(open).toContain("script-src 'self' 'unsafe-inline'");
    expect(open.join('; ')).not.toContain("'nonce-");
    expect(open.join('; ')).not.toContain("'strict-dynamic'");
    expect(open.filter((d) => !d.startsWith('script-src'))).toEqual(
      nonced.filter((d) => !d.startsWith('script-src')),
    );
  });
});
