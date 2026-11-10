import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/modules/core/utils/api-error.util';

import en from '../../../../../i18n/locales/en.json';
import { CreatePageDialog, slugFromPageTitle } from './CreatePageDialog';

const push = vi.fn();
const createAdminPage = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../../services/admin-pages.service', () => ({
  createAdminPage: (...args: unknown[]) => createAdminPage(...args),
}));

function show(existingKeys: string[] = []) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={new QueryClient()}>
        <CreatePageDialog open onOpenChange={vi.fn()} existingKeys={existingKeys} />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('CreatePageDialog', () => {
  afterEach(() => {
    cleanup();
    push.mockReset();
    createAdminPage.mockReset();
  });

  it('generates a slug, checks duplicates, and allows editing it', async () => {
    show(['about']);
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'About' } });
    expect(screen.getByLabelText('Slug')).toHaveValue('about');
    fireEvent.click(screen.getByRole('button', { name: 'Create page' }));
    expect(await screen.findByText('This slug is already in use.')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Page title')).not.toHaveAttribute('aria-invalid');
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'ideas' } });
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'New Ideas' } });
    expect(screen.getByLabelText('Slug')).toHaveValue('ideas');
  });

  it('posts the selected locale/template and navigates only after success', async () => {
    const user = userEvent.setup();
    createAdminPage.mockResolvedValue({ key: 'ideas' });
    show();
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'Ideas' } });
    await user.click(screen.getByLabelText('Language'));
    await user.click(screen.getByRole('option', { name: 'Vietnamese' }));
    await user.click(screen.getByLabelText('Start with'));
    await user.click(screen.getByRole('option', { name: 'Empty blocks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create page' }));
    await waitFor(() =>
      expect(createAdminPage).toHaveBeenCalledWith({
        title: 'Ideas',
        key: 'ideas',
        locale: 'vi',
        template: 'empty',
      }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/pages/ideas'));
  });

  it('normalizes accents in the title', () => {
    expect(slugFromPageTitle('Ý tưởng mới')).toBe('y-tuong-moi');
    expect(slugFromPageTitle('Động lực')).toBe('dong-luc');
    expect(slugFromPageTitle('đường dài')).toBe('duong-dai');
  });

  it('shows only the invalid field error on change, blur, and submit', () => {
    show();
    const title = screen.getByLabelText('Page title');
    const slug = screen.getByLabelText('Slug');
    fireEvent.blur(title);
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(slug).not.toHaveAttribute('aria-invalid');
    expect(title).toHaveAttribute('aria-describedby', 'create-page-title-error');
    fireEvent.change(title, { target: { value: 'Ideas' } });
    expect(title).not.toHaveAttribute('aria-invalid');
    fireEvent.change(slug, { target: { value: 'bad_slug' } });
    expect(slug).toHaveAttribute('aria-invalid', 'true');
    expect(title).not.toHaveAttribute('aria-invalid');
    fireEvent.click(screen.getByRole('button', { name: 'Create page' }));
    expect(createAdminPage).not.toHaveBeenCalled();
  });

  it('maps an API 409 to the linked slug error', async () => {
    createAdminPage.mockRejectedValue(
      new ApiError({ status: 409, code: 'PAGE_KEY_TAKEN', message: 'Taken' }),
    );
    show();
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'Ideas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create page' }));
    expect(await screen.findByText('This slug is already in use.')).toHaveAttribute(
      'id',
      'create-page-key-error',
    );
    expect(screen.getByLabelText('Slug')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Page title')).not.toHaveAttribute('aria-invalid');
  });

  it('flags a reserved public route while typing', () => {
    show();
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'Craft' } });
    expect(screen.getByLabelText('Slug')).toHaveValue('craft');
    expect(screen.getByLabelText('Slug')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Page title')).not.toHaveAttribute('aria-invalid');
    expect(createAdminPage).not.toHaveBeenCalled();
  });

  it('keeps the form and choices available after a request fails', async () => {
    const user = userEvent.setup();
    createAdminPage.mockRejectedValue(new Error('Temporary failure'));
    show();
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'Ideas' } });
    await user.click(screen.getByLabelText('Language'));
    await user.click(screen.getByRole('option', { name: 'Vietnamese' }));
    await user.click(screen.getByLabelText('Start with'));
    await user.click(screen.getByRole('option', { name: 'Empty blocks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create page' }));
    expect(
      await screen.findByText('The page could not be created. Try again.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Page title')).toHaveValue('Ideas');
    expect(screen.getByLabelText('Language')).toHaveTextContent('Vietnamese');
    expect(screen.getByLabelText('Start with')).toHaveTextContent('Empty blocks');
    expect(push).not.toHaveBeenCalled();
  });
});
