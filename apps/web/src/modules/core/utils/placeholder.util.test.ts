import { describe, expect, it } from 'vitest';
import { isPlaceholderText } from './placeholder.util';

describe('editorial placeholders', () => {
  it('hides unset and unfinished copy without rejecting real Vietnamese copy', () => {
    for (const value of [null, undefined, '', ' TODO ', 'Reply time: TBD', 'Lorem ipsum'])
      expect(isPlaceholderText(value)).toBe(true);
    expect(isPlaceholderText('Sẵn sàng trao đổi về sản phẩm')).toBe(false);
    expect(isPlaceholderText('Todoist integration')).toBe(false);
  });
});
