import { describe, expect, it } from 'vitest';

import { corePageKeySchema } from '../pages/pages.enum';
import { BLOCK_REGISTRY } from './block-registry.constant';
import { isBlockAllowedOnPage } from './define-block.util';

describe('block page allowance', () => {
  it('keeps each built-in page allowance on its definition', () => {
    const expectedByPage = {
      home: [
        'hero',
        'cta-band',
        'stat-band',
        'tech-marquee',
        'featured-case',
        'domain-grid',
        'case-grid',
        'process',
        'skill-groups',
        'post-list',
        'principle-list',
        'prose',
      ],
      about: [
        'cta-band',
        'stat-band',
        'tech-marquee',
        'case-grid',
        'skill-groups',
        'post-list',
        'about-intro',
        'timeline',
        'principle-list',
        'education-list',
        'cv-download',
        'prose',
      ],
      projects: [
        'page-header',
        'cta-band',
        'domain-grid',
        'post-list',
        'prose',
        'projects-browser',
      ],
      notes: ['page-header', 'cta-band', 'prose', 'notes-browser'],
      contact: ['cta-band', 'post-list', 'cv-download', 'prose', 'contact-form'],
    };
    for (const pageKey of corePageKeySchema.options) {
      const actual = Object.values(BLOCK_REGISTRY)
        .filter((definition) => isBlockAllowedOnPage(definition, pageKey))
        .map((definition) => definition.type);
      expect(actual).toEqual(expectedByPage[pageKey]);
    }
    expect(isBlockAllowedOnPage(BLOCK_REGISTRY.hero, 'home')).toBe(true);
    expect(isBlockAllowedOnPage(BLOCK_REGISTRY.hero, 'about')).toBe(false);
    expect(isBlockAllowedOnPage(BLOCK_REGISTRY['page-header'], 'projects')).toBe(true);
    expect(isBlockAllowedOnPage(BLOCK_REGISTRY['page-header'], 'home')).toBe(false);
  });

  it.each(['ideas', 'studio-vi'])(
    'allows exactly the three explicitly enabled types on custom page %s',
    (pageKey) => {
      const actual = Object.values(BLOCK_REGISTRY)
        .filter((definition) => isBlockAllowedOnPage(definition, pageKey))
        .map((definition) => definition.type);
      expect(actual).toEqual(['page-header', 'cta-band', 'prose']);
      expect(isBlockAllowedOnPage(BLOCK_REGISTRY.hero, pageKey)).toBe(false);
    },
  );
});
