import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { applyReorder, assertSameIds, reorder } from './reorder.util';

describe('reorder.util', () => {
  it('rejects an ids list that is missing a row', () => {
    try {
      assertSameIds([1, 2, 3], [1, 2]);
      throw new Error('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse() as {
        code: string;
        fieldErrors?: Record<string, string[]>;
      };
      expect(body.code).toBe('VALIDATION_FAILED');
      expect(body.fieldErrors?.ids).toBeDefined();
    }
  });

  it('rejects duplicate ids', () => {
    expect(() => assertSameIds([1, 2], [1, 1])).toThrow(BadRequestException);
  });

  it('leaves sortOrder unchanged when the third update throws', async () => {
    const written: Array<{ id: number; sortOrder: number }> = [];
    const delegate = {
      findMany: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
      update: vi.fn(async (args: { where: { id: number }; data: { sortOrder: number } }) => {
        if (written.length === 2) {
          throw new Error('forced');
        }
        written.push({ id: args.where.id, sortOrder: args.data.sortOrder });
      }),
    };

    await expect(applyReorder(delegate, [3, 2, 1])).rejects.toThrow('forced');
    expect(written).toEqual([
      { id: 3, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
    ]);
    expect(delegate.update).toHaveBeenCalledTimes(3);
  });

  it('writes sortOrder = index inside one transaction', async () => {
    const updates: Array<{ id: number; sortOrder: number }> = [];
    const prisma = {
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    };
    await reorder(
      prisma,
      () => ({
        findMany: async () => [{ id: 10 }, { id: 20 }],
        update: async (args) => {
          updates.push({ id: args.where.id, sortOrder: args.data.sortOrder });
        },
      }),
      [20, 10],
    );
    expect(updates).toEqual([
      { id: 20, sortOrder: 0 },
      { id: 10, sortOrder: 1 },
    ]);
  });
});
