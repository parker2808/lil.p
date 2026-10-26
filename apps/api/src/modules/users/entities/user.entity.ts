import type { Prisma } from '../../../generated/prisma/client';

export const userSelect = {
  id: true,
  email: true,
  name: true,
  passwordHash: true,
  role: true,
  isActive: true,
  tokenVersion: true,
  lastLoginAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;
