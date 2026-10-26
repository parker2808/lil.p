import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';

vi.mock('../../actions/contact.action', () => ({
  submitContact: vi.fn(),
  submitContactForm: vi.fn(async () => ({ ok: false, fieldErrors: { name: ['Required'] } })),
}));

import { submitContact } from '../../actions/contact.action';
import { ContactForm } from './ContactForm';

const submit = vi.mocked(submitContact);

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>
        <ContactForm
          locale="en"
          topics={[{ id: 1, slug: 'job', label: 'Job opportunity', lang: 'en' }]}
        />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('ContactForm', () => {
  afterEach(() => {
    cleanup();
    submit.mockReset();
  });

  it('shows a summary and field errors when submitted empty', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Please fix the highlighted fields.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
  });

  it('replaces the form after a successful submit', async () => {
    submit.mockResolvedValue({ ok: true });
    renderForm();
    await userEvent.type(screen.getByLabelText('Name'), 'Ana');
    await userEvent.type(screen.getByLabelText('Email'), ['visitor', 'example.com'].join('@'));
    await userEvent.type(screen.getByLabelText('Message'), 'Hello from the form');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Message sent')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
  });

  it('keeps the honeypot visually hidden and unfocusable', () => {
    renderForm();
    const input = document.getElementById('website');
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input?.closest('[aria-hidden="true"]')).toBeTruthy();
  });
});
