import { BadRequestException, ConflictException } from '@nestjs/common';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import {
  assertAllowedOnPage,
  assertCanDelete,
  assertCanHide,
  assertInsertKeepsH1First,
  assertLayoutAllowed,
  assertWithinLimit,
  nextBlockKey,
} from './pages-rules.util';

function codeOf(error: unknown): string | undefined {
  if (error instanceof BadRequestException || error instanceof ConflictException) {
    const body = error.getResponse();
    if (typeof body === 'object' && body && 'code' in body) {
      return (body as { code: string }).code;
    }
  }
  return undefined;
}

describe('pages-rules.util', () => {
  it('rejects a type that is not allowed on the page', () => {
    try {
      assertAllowedOnPage(BLOCK_REGISTRY.hero, 'about');
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_NOT_ALLOWED');
    }
  });

  it('rejects a type over maxPerPage', () => {
    try {
      assertWithinLimit(BLOCK_REGISTRY.hero, 1);
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_LIMIT');
    }
  });

  it('locks the H1 block against delete and hide', () => {
    try {
      assertCanDelete(BLOCK_REGISTRY.hero);
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_LOCKED');
    }
    try {
      assertCanHide(BLOCK_REGISTRY['about-intro']);
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_LOCKED');
    }
  });

  it('keeps required blocks from being deleted or hidden', () => {
    try {
      assertCanDelete(BLOCK_REGISTRY['projects-browser']);
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_REQUIRED');
    }
    try {
      assertCanHide(BLOCK_REGISTRY['notes-browser']);
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_REQUIRED');
    }
  });

  it('rejects a layout the type does not list', () => {
    try {
      assertLayoutAllowed(BLOCK_REGISTRY.hero, 'THREE');
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('VALIDATION_FAILED');
    }
  });

  it('derives unique keys from the type', () => {
    expect(nextBlockKey('case-grid', [])).toBe('case-grid');
    expect(nextBlockKey('case-grid', ['case-grid'])).toBe('case-grid-2');
    expect(nextBlockKey('case-grid', ['case-grid', 'case-grid-2'])).toBe('case-grid-3');
  });

  it('refuses an insert that would move ahead of the H1', () => {
    try {
      assertInsertKeepsH1First(0, [{ id: 1, type: 'hero', sortOrder: 0 }]);
      throw new Error('expected throw');
    } catch (error) {
      expect(codeOf(error)).toBe('BLOCK_LOCKED');
    }
  });
});
