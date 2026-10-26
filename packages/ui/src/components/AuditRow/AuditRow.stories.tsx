import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuditRow } from './AuditRow';

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
  title: 'Admin/AuditRow',
  component: AuditRow,
} satisfies Meta<typeof AuditRow>;

export default meta;

export const Create: StoryObj<typeof AuditRow> = {
  args: {
    labels,
    item: {
      id: 1,
      userId: 1,
      userName: 'Admin',
      action: 'CREATE',
      entityType: 'project',
      entityId: '1',
      summary: 'Created project particula',
      createdAt: new Date().toISOString(),
    },
  },
};
