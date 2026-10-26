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
});
