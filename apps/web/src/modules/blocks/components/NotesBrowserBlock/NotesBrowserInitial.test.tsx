import { postFixture } from '@portfolio/contracts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { NotesBrowserInitial } from './NotesBrowserInitial';

describe('notes browser streamed fallback', () => {
  it.each(['en', 'vi'] as const)('renders real initial note links for %s without JS', (locale) => {
    const html = renderToStaticMarkup(
      <NotesBrowserInitial
        page={{ items: [postFixture], page: 1, pageSize: 10, total: 1 }}
        locale={locale}
        empty="No notes"
      />,
    );
    expect(html).toContain(`href="/${locale}/notes/sample-note"`);
    expect(html).toContain('class="inline-flex min-h-6 min-w-6 items-center"');
    expect(html).toContain(postFixture.title);
  });

  it('renders a localized empty message for an empty initial list', () => {
    const html = renderToStaticMarkup(
      <NotesBrowserInitial
        page={{ items: [], page: 1, pageSize: 10, total: 0 }}
        locale="vi"
        empty="Chưa có bài viết"
      />,
    );
    expect(html).toContain('Chưa có bài viết');
  });
});
