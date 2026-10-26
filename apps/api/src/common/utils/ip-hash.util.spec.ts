import { describe, expect, it } from 'vitest';

import { hashIp, requestIp, utcDayKey } from './ip-hash.util';

describe('ip-hash', () => {
  it('is stable for the same IP, salt and UTC day', () => {
    const day = new Date('2026-10-26T12:00:00.000Z');
    expect(hashIp('203.0.113.10', 'salt', day)).toBe(hashIp('203.0.113.10', 'salt', day));
  });

  it('changes when the UTC day rolls over', () => {
    const monday = new Date('2026-10-26T23:00:00.000Z');
    const tuesday = new Date('2026-10-27T01:00:00.000Z');
    expect(utcDayKey(monday)).toBe('2026-10-26');
    expect(utcDayKey(tuesday)).toBe('2026-10-27');
    expect(hashIp('203.0.113.10', 'salt', monday)).not.toBe(
      hashIp('203.0.113.10', 'salt', tuesday),
    );
  });

  it('reads the first x-forwarded-for hop', () => {
    expect(
      requestIp({
        headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
        ip: '127.0.0.1',
      } as never),
    ).toBe('203.0.113.10');
  });
});
