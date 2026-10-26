import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';

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
