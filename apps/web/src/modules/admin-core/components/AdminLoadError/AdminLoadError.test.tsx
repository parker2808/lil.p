import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { AdminLoadError } from './AdminLoadError';

afterEach(cleanup);

describe('AdminLoadError', () => {
  it('offers retry and a link back to the parent list', () => {
    const onRetry = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AdminLoadError
          navKey="projects"
          message="This project could not be loaded."
          onRetry={onRetry}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This project could not be loaded.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Back to Projects' })).toHaveAttribute(
      'href',
      '/admin/projects',
    );
  });
});
