import { describe, expect, it } from 'vitest';

import {
  lintErrors,
  markdownAltErrors,
  mediaAltErrors,
  requiredFieldErrors,
} from './publish-rules.util';

describe('publish-rules', () => {
  it('flags empty required English fields', () => {
    expect(requiredFieldErrors({ titleEn: '  ', bodyEn: 'ok' })).toEqual({
      titleEn: ['Required'],
    });
  });

  it('flags TODO via publishLint', () => {
    expect(lintErrors({ bodyEn: 'TODO: later' }).bodyEn).toContain('Must not contain TODO');
  });

  it('flags a cover image without alt', () => {
    expect(mediaAltErrors({ altEn: '', mimeType: 'image/jpeg' }, 'cover')).toEqual({
      cover: ['Image is missing alt text'],
    });
    expect(mediaAltErrors({ altEn: 'Cover', mimeType: 'image/jpeg' }, 'cover')).toEqual({});
  });

  it('flags markdown images with empty alt', () => {
    expect(markdownAltErrors('See ![](/api/public/media/a)', 'bodyEn').bodyEn).toEqual([
      'Image is missing alt text',
    ]);
    expect(markdownAltErrors('See ![Cover](/api/public/media/a)', 'bodyEn')).toEqual({});
  });
});
