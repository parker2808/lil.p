import type { Me } from '@portfolio/contracts';

import type { UserRow } from './user.entity';

export function toMeDto(row: UserRow): Me {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}
