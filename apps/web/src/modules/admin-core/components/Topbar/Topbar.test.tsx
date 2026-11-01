import type { Me } from '@portfolio/contracts';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../../i18n/locales/en.json';
import { MeProvider } from '../../hooks/use-me.hook';
import { AdminUiProvider, useAdminUi } from '../../stores/admin-ui.store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ replace: vi.fn() }),
}));

import { Topbar } from './Topbar';

const admin: Me = { id: 1, email: '<email>', name: 'Parker', role: 'admin' };

function CollapsedState() {
  const { collapsed } = useAdminUi();
  return <output data-testid="collapsed">{String(collapsed)}</output>;
}

function renderTopbar() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <MeProvider me={admin}>
        <AdminUiProvider>
          <Topbar crumbs={[{ label: 'Dashboard' }]} />
          <CollapsedState />
        </AdminUiProvider>
      </MeProvider>
    </NextIntlClientProvider>,
  );
}

afterEach(cleanup);

describe('Topbar', () => {
  it('collapses the sidebar with an icon button', () => {
    renderTopbar();
    const collapse = screen.getByRole('button', { name: 'Collapse sidebar' });

    expect(collapse).toHaveClass('redesign-button', 'size-8', 'p-0');
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    expect(collapse).toHaveTextContent('');
    expect(collapse.querySelector('svg')).not.toBeNull();

    fireEvent.click(collapse);

    expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses compact shared controls without height overrides', () => {
    renderTopbar();

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass('h-7');
    const language = screen.getByRole('combobox', { name: 'Language' });
    expect(language).toHaveClass('border-input', 'h-8', 'rounded-md');
  });
});
