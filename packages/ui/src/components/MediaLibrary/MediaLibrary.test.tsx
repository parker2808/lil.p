import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaLibrary, type MediaLibraryItem } from './MediaLibrary';

const labels = { missingAlt: 'Missing alt', empty: 'No files', pdf: 'PDF' };

function item(id: number, missingAlt = false): MediaLibraryItem {
  return {
    id,
    url: `https://media.test/${id}`,
    alt: missingAlt ? '' : `Alt ${id}`,
    originalName: `file-${id}.jpg`,
    mimeType: 'image/jpeg',
    missingAlt,
  };
}

const clientHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
const clientWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');

function stubScrollerSize() {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return 384;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return 800;
    },
  });
}

function restoreScrollerSize() {
  if (clientHeightDesc) {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDesc);
  }
  if (clientWidthDesc) {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDesc);
  }
}

describe('MediaLibrary', () => {
  beforeEach(() => {
    stubScrollerSize();
  });

  afterEach(() => {
    restoreScrollerSize();
    vi.restoreAllMocks();
  });

  it('warns when alt is missing and selects a tile', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MediaLibrary items={[item(1, true), item(2)]} labels={labels} onSelect={onSelect} />);
    expect(screen.getByText('Missing alt')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /file-2/i }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('virtualizes 1000 items so the scroll height matches the row count', () => {
    const items = Array.from({ length: 1000 }, (_, index) => item(index + 1));
    const { container } = render(<MediaLibrary items={items} labels={labels} />);
    const scroller = container.querySelector('[data-slot="media-library"]');
    expect(scroller).toBeTruthy();
    const inner = scroller?.firstElementChild as HTMLElement;
    expect(inner.style.height).toBe(`${Math.ceil(1000 / 4) * 168}px`);
    expect(screen.getAllByRole('button').length).toBeLessThan(1000);
  });
});
