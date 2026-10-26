import { describe, expect, it } from 'vitest';

import {
  deviceFromUa,
  isBotUa,
  isPublicViewPath,
  referrerHost,
  visitorHash,
} from './analytics.util';

describe('analytics.util', () => {
  it('accepts public locale-agnostic paths', () => {
    expect(isPublicViewPath('/')).toBe(true);
    expect(isPublicViewPath('/projects/live-case')).toBe(true);
    expect(isPublicViewPath('/admin')).toBe(false);
    expect(isPublicViewPath('/api/public/views')).toBe(false);
  });

  it('drops same-host referrers and bots', () => {
    expect(referrerHost('https://example.test/about', 'example.test')).toBeNull();
    expect(referrerHost('https://github.com/x', 'example.test')).toBe('github.com');
    expect(isBotUa('Googlebot/2.1')).toBe(true);
    expect(isBotUa('Mozilla/5.0')).toBe(false);
  });

  it('classifies devices and hashes visitors per day', () => {
    expect(deviceFromUa('iPad')).toBe('tablet');
    expect(deviceFromUa('iPhone')).toBe('mobile');
    expect(deviceFromUa('Mozilla/5.0')).toBe('desktop');
    const a = visitorHash('1.1.1.1', 'Mozilla', 'salt', new Date('2026-01-01T12:00:00Z'));
    const b = visitorHash('1.1.1.1', 'Mozilla', 'salt', new Date('2026-01-02T12:00:00Z'));
    expect(a).toHaveLength(64);
    expect(a).not.toBe(b);
  });
});
