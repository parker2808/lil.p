import type { AdminBlock } from '@portfolio/contracts';
import { cleanup, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import viMessages from '../../../../../i18n/locales/vi.json';

import { BlockRow } from './BlockRow';

const baseBlock: AdminBlock = {
  id: 1,
  type: 'page-header',
  key: 'page-header',
  layout: 'ONE',
  surface: 'PLAIN',
  schemaVersion: 1,
  props: {},
  isVisible: true,
  sortOrder: 0,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const labels = {
  menu: 'Menu',
  moveUp: 'Move up',
  moveDown: 'Move down',
  duplicate: 'Duplicate',
  delete: 'Delete',
  visible: 'Visible',
  unknown: 'Unknown block',
};

function renderRow(locale: 'en' | 'vi', block: AdminBlock) {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : viMessages}>
      <BlockRow
        block={block}
        selected={false}
        readOnly
        handle={null}
        labels={labels}
        onSelect={vi.fn()}
        onToggle={vi.fn()}
        onMove={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />
    </NextIntlClientProvider>,
  );
}

describe('BlockRow labels', () => {
  afterEach(cleanup);

  for (const [locale, pageHeader, prose] of [
    ['en', 'Page header', 'Prose'],
    ['vi', 'Tiêu đề trang', 'Văn bản'],
  ] as const) {
    it(`uses translated primary labels and secondary keys in ${locale}`, () => {
      const { rerender } = renderRow(locale, baseBlock);
      const button = screen.getByRole('button', { name: /page.header/i });
      expect(within(button).getByText(pageHeader)).toBeInTheDocument();
      expect(within(button).getByText('page-header')).toHaveClass('font-mono');

      rerender(
        <NextIntlClientProvider locale={locale} messages={locale === 'en' ? en : viMessages}>
          <BlockRow
            block={{ ...baseBlock, type: 'prose', key: 'prose' }}
            selected={false}
            readOnly
            handle={null}
            labels={labels}
            onSelect={vi.fn()}
            onToggle={vi.fn()}
            onMove={vi.fn()}
            onDuplicate={vi.fn()}
            onDelete={vi.fn()}
          />
        </NextIntlClientProvider>,
      );
      const proseButton = screen.getByRole('button', { name: /prose|văn bản/i });
      expect(within(proseButton).getByText(prose)).toBeInTheDocument();
      expect(within(proseButton).getByText('prose')).toHaveClass('font-mono');
    });

    it(`translates a known block with validation issues in ${locale}`, () => {
      renderRow(locale, { ...baseBlock, issues: ['Invalid content'] });
      expect(screen.getByText(pageHeader)).toBeInTheDocument();
      expect(screen.getByText('page-header')).toHaveClass('font-mono');
    });
  }
});
