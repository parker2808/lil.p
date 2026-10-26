import { describe, expect, it, vi } from 'vitest';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns { status: "ok", db: "ok" } after SELECT 1', async () => {
    const prisma = { $queryRaw: vi.fn().mockResolvedValue([{ 1: 1n }]) };
    const controller = new HealthController(prisma as never);

    await expect(controller.getHealth()).resolves.toEqual({ status: 'ok', db: 'ok' });
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
