import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import en from '../../../../../i18n/locales/en.json';
import viMessages from '../../../../../i18n/locales/vi.json';

vi.mock('@/modules/admin-core/components/MarkdownField/MarkdownField', () => ({
  MarkdownField: () => null,
}));

import { SchemaForm } from './SchemaForm';

function renderForm(
  type: keyof typeof BLOCK_REGISTRY,
  extras?: { fieldErrors?: Record<string, string>; readOnly?: boolean },
) {
  const definition = BLOCK_REGISTRY[type];
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SchemaForm
        schema={definition.props}
        defaultValues={definition.defaults as Record<string, unknown>}
        fieldErrors={extras?.fieldErrors}
        readOnly={extras?.readOnly}
      />
    </NextIntlClientProvider>,
  );
}

describe('SchemaForm', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a form for every block type', () => {
    for (const type of Object.keys(BLOCK_REGISTRY) as (keyof typeof BLOCK_REGISTRY)[]) {
      const view = renderForm(type);
      expect(view.container.querySelector('[data-slot="field"]')).not.toBeNull();
      view.unmount();
    }
  });

  it.each([
    ['en', en, 'English', 'Vietnamese'],
    ['vi', viMessages, 'Tiếng Anh', 'Tiếng Việt'],
  ] as const)(
    'gives each localized input and textarea a distinct %s name',
    (locale, messages, enName, viName) => {
      const pageHeader = BLOCK_REGISTRY['page-header'];
      const headerView = render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SchemaForm
            schema={pageHeader.props}
            defaultValues={pageHeader.defaults as Record<string, unknown>}
          />
        </NextIntlClientProvider>,
      );
      const title = messages.admin.blocks.pageHeader.title;
      expect(screen.getByRole('textbox', { name: `${title} (${enName})` })).toHaveAttribute(
        'id',
        'title.en',
      );
      expect(screen.getByRole('textbox', { name: `${title} (${viName})` })).toHaveAttribute(
        'id',
        'title.vi',
      );
      headerView.unmount();

      const textareaSchema = z.object({
        intro: z.object({
          en: z.string().meta({ widget: 'textarea', label: 'admin.blocks.cta.intro' }),
          vi: z.string().meta({ widget: 'textarea' }),
        }),
      });
      render(
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SchemaForm schema={textareaSchema} defaultValues={{ intro: { en: '', vi: '' } }} />
        </NextIntlClientProvider>,
      );
      const intro = messages.admin.blocks.cta.intro;
      expect(screen.getByRole('textbox', { name: `${intro} (${enName})` }).tagName).toBe(
        'TEXTAREA',
      );
      expect(screen.getByRole('textbox', { name: `${intro} (${viName})` }).tagName).toBe(
        'TEXTAREA',
      );
    },
  );

  it('shows a zod message when the English CTA label is empty', async () => {
    renderForm('hero');
    const input = document.getElementById('primaryCta.label.en');
    expect(input).toBeTruthy();
    await userEvent.clear(input as HTMLInputElement);
    expect(
      await screen.findByText(/String must contain at least 1 character|Too small|min/i),
    ).toBeInTheDocument();
  });

  it('shows a server error under the English CTA label', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SchemaForm
          schema={BLOCK_REGISTRY.hero.props}
          defaultValues={BLOCK_REGISTRY.hero.defaults as Record<string, unknown>}
          fieldErrors={{ 'props.primaryCta.label.en': 'Server said no' }}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Server said no')).toBeInTheDocument();
  });

  it('disables every input when readOnly', () => {
    renderForm('hero', { readOnly: true });
    for (const input of screen.getAllByRole('textbox')) {
      expect(input).toBeDisabled();
    }
    for (const input of screen.getAllByRole('switch')) {
      expect(input).toBeDisabled();
    }
  });
});
