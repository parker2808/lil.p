'use client';

import type { Role } from '@portfolio/contracts';
import type { ReactNode } from 'react';

import { useMe } from '../../hooks/use-me.hook';

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { role } = useMe();
  if (!allow.includes(role)) {
    return null;
  }
  return children;
}
