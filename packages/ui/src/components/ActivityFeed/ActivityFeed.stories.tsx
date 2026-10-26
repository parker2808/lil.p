import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuditRow } from '../AuditRow/AuditRow';
import { ActivityFeed } from './ActivityFeed';

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

const meta = {
  title: 'Admin/ActivityFeed',
  component: ActivityFeed,
} satisfies Meta<typeof ActivityFeed>;

export default meta;

export const WithRows: StoryObj<typeof ActivityFeed> = {
  render: () => (
    <ActivityFeed empty={<p>No activity yet.</p>}>
      <li>
        <AuditRow
          labels={labels}
          item={{
            id: 2,
            userId: 1,
            userName: 'Admin',
            action: 'PUBLISH',
            entityType: 'project',
            entityId: '1',
            summary: 'Published project particula',
            createdAt: new Date().toISOString(),
          }}
        />
      </li>
    </ActivityFeed>
  ),
};
