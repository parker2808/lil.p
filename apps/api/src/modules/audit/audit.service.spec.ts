import { describe, expect, it, vi } from 'vitest';

import { AuditService } from './audit.service';

describe('AuditService', () => {
  it('pages older than the cursor and reports the next cursor', async () => {
    const rows = [auditRow(5), auditRow(4), auditRow(3)];
    const findMany = vi.fn().mockResolvedValue(rows);
    const service = new AuditService({ auditLog: { findMany } } as never);
    const page = await service.list({ limit: 2 });
    expect(page.items.map((item) => item.id)).toEqual([5, 4]);
    expect(page.nextCursor).toBe(4);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { id: 'desc' },
        take: 3,
      }),
    );
  });

  it('filters by entity type and user', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new AuditService({ auditLog: { findMany } } as never);
    await service.list({ limit: 20, entityType: 'project', userId: 3, cursor: 9 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { lt: 9 }, entityType: 'project', userId: 3 },
      }),
    );
  });
});

function auditRow(id: number) {
  return {
    id,
    userId: 1,
    user: { name: 'Admin' },
    action: 'CREATE' as const,
    entityType: 'project',
    entityId: String(id),
    summary: `Created project ${id}`,
    createdAt: new Date('2026-10-26T12:00:00.000Z'),
  };
}
