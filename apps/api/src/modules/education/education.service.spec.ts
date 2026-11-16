import { describe, expect, it, vi } from 'vitest';

import { EducationService } from './education.service';

const row = {
  id: 1,
  school: 'Example Academy',
  degreeEn: 'Certificate',
  degreeVi: 'Chứng chỉ',
  majorEn: 'Design',
  majorVi: 'Thiết kế',
  startDate: new Date('2022-01-01'),
  endDate: new Date('2023-01-01'),
  sortOrder: 0,
  isVisible: true,
  updatedAt: new Date('2026-11-15'),
};

describe('EducationService public cache', () => {
  it('expires education before returning from create, update, reorder and remove', async () => {
    const education = {
      create: vi.fn().mockResolvedValue(row),
      findUnique: vi.fn().mockResolvedValue(row),
      findMany: vi.fn().mockResolvedValue([row]),
      update: vi.fn().mockResolvedValue(row),
      delete: vi.fn().mockResolvedValue(row),
    };
    const prisma = {
      education,
      $transaction: vi.fn(async (work: (db: { education: typeof education }) => Promise<unknown>) =>
        work({ education }),
      ),
    };
    const publishing = { revalidate: vi.fn().mockResolvedValue(undefined) };
    const service = new EducationService(prisma as never, undefined, publishing as never);

    await service.create({ school: row.school } as never);
    await service.update(row.id, { school: 'Updated Academy' });
    await service.reorder([row.id]);
    await service.remove(row.id);

    expect(publishing.revalidate).toHaveBeenCalledTimes(4);
    expect(publishing.revalidate).toHaveBeenNthCalledWith(1, ['education']);
    expect(publishing.revalidate).toHaveBeenNthCalledWith(2, ['education']);
    expect(publishing.revalidate).toHaveBeenNthCalledWith(3, ['education']);
    expect(publishing.revalidate).toHaveBeenNthCalledWith(4, ['education']);
  });
});
