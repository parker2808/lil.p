import { markdownKitchenSink, markdownUnsafe } from '@portfolio/contracts';
import { describe, expect, it } from 'vitest';

import { extractToc } from './toc.util';

describe('extractToc', () => {
  it('collects h2 and h3 from the kitchen sink', () => {
    expect(extractToc(markdownKitchenSink)).toEqual([
      { id: 'heading-two', title: 'Heading two', depth: 2 },
      { id: 'heading-three', title: 'Heading three', depth: 3 },
    ]);
  });

  it('treats a stored h1 as an h2', () => {
    expect(extractToc(markdownUnsafe)).toEqual([
      { id: 'top-heading', title: 'Top heading', depth: 2 },
    ]);
  });
});
