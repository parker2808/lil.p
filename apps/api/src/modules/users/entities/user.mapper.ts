import type { AdminUser, Me } from '@portfolio/contracts';

import type { UserRow } from './user.entity';

export function toMeDto(row: UserRow): Me {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

export function toAdminUser(row: UserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}
