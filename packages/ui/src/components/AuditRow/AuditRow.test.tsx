import type { AdminAuditLog } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuditRow } from './AuditRow';

const item: AdminAuditLog = {
  id: 3,
  userId: 1,
  userName: 'Admin',
  action: 'CREATE',
  entityType: 'project',
  entityId: '9',
  summary: 'Created project particula',
  createdAt: '2026-10-26T12:00:00.000Z',
};

const labels = {
  actions: {
    CREATE: 'Create',
    UPDATE: 'Update',
    PUBLISH: 'Publish',
    ARCHIVE: 'Archive',
    RESTORE: 'Restore',
    LOGIN: 'Login',
  },
  system: 'System',
};

describe('AuditRow', () => {
  it('shows the summary, actor, and a relative time with an absolute tooltip', () => {
    render(<AuditRow item={item} labels={labels} now={Date.parse('2026-10-26T12:05:00.000Z')} />);
    expect(screen.getByText('Created project particula')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    const time = screen.getByText('5 minutes ago');
    expect(time).toHaveAttribute('title');
    expect(time.getAttribute('datetime')).toBe(item.createdAt);
  });
});
