import { describe, expect, it } from 'vitest';

import { draftPreviewSrc, publicPagePath } from './preview-frame.util';

describe('preview-frame', () => {
  it('builds public and draft URLs', () => {
    expect(publicPagePath('home', 'en')).toBe('/en');
    expect(publicPagePath('about', 'vi', 2)).toBe('/vi/about?v=2');
    expect(draftPreviewSrc('home', 'en')).toBe('/api/draft?path=%2Fen');
    expect(draftPreviewSrc('projects', 'en', 3)).toBe('/en/projects?v=3');
  });
});
