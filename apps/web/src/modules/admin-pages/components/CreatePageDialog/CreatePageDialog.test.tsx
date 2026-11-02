import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'ideas' } });
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'New Ideas' } });
    expect(screen.getByLabelText('Slug')).toHaveValue('ideas');
  });

  it('posts the selected locale/template and navigates only after success', async () => {
    createAdminPage.mockResolvedValue({ key: 'ideas' });
    show();
    fireEvent.change(screen.getByLabelText('Page title'), { target: { value: 'Ideas' } });
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'vi' } });
    fireEvent.change(screen.getByLabelText('Start with'), { target: { value: 'empty' } });
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
  });
});
