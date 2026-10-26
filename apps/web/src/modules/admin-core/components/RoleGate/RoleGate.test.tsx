import type { Me } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MeProvider } from '../../hooks/use-me.hook';
import { RoleGate } from './RoleGate';

const user: Me = { id: 2, email: '<email>', name: 'Reviewer', role: 'user' };
const admin: Me = { id: 1, email: '<email>', name: 'Parker', role: 'admin' };

describe('RoleGate', () => {
  it('hides write controls from a user reviewer', () => {
    render(
      <MeProvider me={user}>
        <RoleGate allow={['admin']}>
          <button type="button">Save</button>
        </RoleGate>
      </MeProvider>,
    );
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('shows write controls to an admin', () => {
    render(
      <MeProvider me={admin}>
        <RoleGate allow={['admin']}>
          <button type="button">Save</button>
        </RoleGate>
      </MeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
