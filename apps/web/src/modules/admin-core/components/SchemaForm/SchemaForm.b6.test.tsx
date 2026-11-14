import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import viMessages from '../../../../../i18n/locales/vi.json';

vi.mock('@/modules/admin-core/components/MarkdownField/MarkdownField', () => ({
  MarkdownField: () => null,
}));

import { SchemaForm } from './SchemaForm';

describe('B6 host-configurable schema fields', () => {
  for (const [locale, messages, english, vietnamese] of [
    ['en', en, 'English', 'Vietnamese'],
    ['vi', viMessages, 'Tiếng Anh', 'Tiếng Việt'],
  ] as const) {
    it(`names both localized controls in ${locale} and preserves read-only state`, () => {
      const { unmount } = render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SchemaForm
            schema={BLOCK_REGISTRY.hero.props}
            defaultValues={BLOCK_REGISTRY.hero.defaults as Record<string, unknown>}
            readOnly
          />
        </NextIntlClientProvider>,
      );
      const englishControls = screen.getAllByRole('textbox', {
        name: new RegExp(`\\(${english}\\)`),
      });
      const vietnameseControls = screen.getAllByRole('textbox', {
        name: new RegExp(`\\(${vietnamese}\\)`),
      });
      for (const control of [...englishControls, ...vietnameseControls]) {
        expect(control).toBeDisabled();
      }
      unmount();
    });
  }
});
