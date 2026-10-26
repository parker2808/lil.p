import { describe, expect, it } from 'vitest';

import { detectMediaKind } from './media-kind.util';

describe('detectMediaKind', () => {
  it('accepts JPEG, PNG, WebP, AVIF and PDF from magic bytes', () => {
    expect(detectMediaKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe('image/jpeg');
    expect(
      detectMediaKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime,
    ).toBe('image/png');
    expect(detectMediaKind(Buffer.from('RIFF....WEBP'))?.mime).toBe('image/webp');
    const avif = Buffer.alloc(12);
    avif.write('ftyp', 4);
    avif.write('avif', 8);
    expect(detectMediaKind(avif)?.mime).toBe('image/avif');
    expect(detectMediaKind(Buffer.from('%PDF-1.4\n'))).toEqual({
      mime: 'application/pdf',
      resourceType: 'raw',
    });
  });

  it('rejects an exe renamed to jpg', () => {
    const exe = Buffer.from('MZ\x90\x00this is not a jpeg');
    expect(detectMediaKind(exe)).toBeNull();
  });
});
