import { describe, expect, it } from 'vitest';

import { splitMarkdownSections } from './split-sections.util';

describe('splitMarkdownSections', () => {
  it('returns the whole field when there are no h3 headings', () => {
    expect(splitMarkdownSections('Just a paragraph.')).toEqual([
      { title: '', body: 'Just a paragraph.' },
    ]);
  });

  it('splits on h3 headings', () => {
    const source = `### Functional
Keep the contract

### Non-functional
Stay small`;

    expect(splitMarkdownSections(source)).toEqual([
      { title: 'Functional', body: 'Keep the contract' },
      { title: 'Non-functional', body: 'Stay small' },
    ]);
  });

  it('returns nothing for empty input', () => {
    expect(splitMarkdownSections('  ')).toEqual([]);
  });
});
