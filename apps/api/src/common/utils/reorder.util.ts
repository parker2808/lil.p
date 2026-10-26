import { BadRequestException } from '@nestjs/common';

export type ReorderDelegate = {
  findMany(args: { where?: object; select: { id: true } }): Promise<Array<{ id: number }>>;
  update(args: { where: { id: number }; data: { sortOrder: number } }): Promise<unknown>;
};

export type Transactional = {
  $transaction: (fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>;
};

export function assertSameIds(current: number[], incoming: number[]): void {
  const currentSet = new Set(current);
  const incomingSet = new Set(incoming);
  if (
    current.length !== incoming.length ||
    incomingSet.size !== incoming.length ||
    incoming.some((id) => !currentSet.has(id))
  ) {
    throw new BadRequestException({
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      fieldErrors: { ids: ['Must list every current id exactly once'] },
    });
  }
}

export async function applyReorder(
  delegate: ReorderDelegate,
  ids: number[],
  where?: object,
): Promise<void> {
  const current = await delegate.findMany({ where, select: { id: true } });
  assertSameIds(
    current.map((row) => row.id),
    ids,
  );
  for (const [index, id] of ids.entries()) {
    await delegate.update({ where: { id }, data: { sortOrder: index } });
  }
}

export async function reorder(
  prisma: Transactional,
  getDelegate: (tx: unknown) => ReorderDelegate,
  ids: number[],
  where?: object,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await applyReorder(getDelegate(tx), ids, where);
  });
}
