import { describe, expect, it } from 'vitest';

import { isAllowedImageSrc, isAllowedMarkdownUrl } from './markdown-url.util';

describe('markdown url allowlist', () => {
  it('allows relative, hash, http(s) and mailto links', () => {
    expect(isAllowedMarkdownUrl('/notes/sample')).toBe(true);
    expect(isAllowedMarkdownUrl('#heading')).toBe(true);
    expect(isAllowedMarkdownUrl('https://example.com')).toBe(true);
    expect(isAllowedMarkdownUrl('mailto:<email>')).toBe(true);
  });

  it('rejects javascript and protocol-relative urls', () => {
    expect(isAllowedMarkdownUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedMarkdownUrl('//evil.example')).toBe(false);
  });

  it('allows only public media images', () => {
    expect(isAllowedImageSrc('/api/public/media/cover.webp')).toBe(true);
    expect(isAllowedImageSrc('https://evil.example/x.png')).toBe(false);
  });
});
