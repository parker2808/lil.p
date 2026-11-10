import { describe, expect, it, vi } from 'vitest';

import { BuilderDraftService } from './builder-draft.service';
import { builderDraftInputSchema, revisionSchema } from './dto/builder-draft.dto';

const emptyTree = {
  schemaVersion: 1,
  root: { id: 'page-root', type: 'page', responsive: { base: {} }, sections: [] },
};
const publishReadyTree = {
  schemaVersion: 1,
  root: {
    ...emptyTree.root,
    sections: [
      {
        id: 'section',
        type: 'section',
        responsive: { base: {} },
        content: [
          {
            id: 'heading',
            type: 'component',
            componentType: 'heading',
            responsive: { base: { text: 'Ideas', level: 1 } },
          },
        ],
      },
    ],
  },
};

function setup(revision = 0n) {
  const page = {
    id: 17,
    key: 'ideas',
    draftTree: null as unknown,
    draftTreeRevision: revision,
  };
  const prisma = {
    page: {
      findUnique: vi.fn(async () => ({ ...page })),
      updateMany: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { draftTreeRevision: bigint; draftTree: { equals?: unknown; not?: unknown } };
          data: { draftTree: unknown; draftTreeRevision: { increment: number } };
        }) => {
          const isLegacy = page.draftTree === null;
          if (
            where.draftTreeRevision !== page.draftTreeRevision ||
            (isLegacy ? !('equals' in where.draftTree) : !('not' in where.draftTree))
          ) {
            return { count: 0 };
          }
          page.draftTree = data.draftTree;
          page.draftTreeRevision += BigInt(data.draftTreeRevision.increment);
          return { count: 1 };
        },
      ),
    },
  };
  return { page, prisma, service: new BuilderDraftService(prisma as never) };
}

describe('builder draft revision contract', () => {
  it('reads legacy without converting blocks and serializes a large revision exactly', async () => {
    const { service } = setup(9007199254740993n);
    expect(await service.get('ideas')).toEqual({
      mode: 'legacy',
      revision: '9007199254740993',
      tree: null,
    });
    expect(revisionSchema.safeParse('9007199254740993').success).toBe(true);
    expect(revisionSchema.safeParse('01').success).toBe(false);
    expect(revisionSchema.safeParse('9223372036854775808').success).toBe(false);
  });

  it('adopts an incomplete tree, reloads it and rejects stale or wrong-mode writers', async () => {
    const { service, prisma, page } = setup();
    expect(
      await service.activate('ideas', { expectedRevision: '0', tree: emptyTree }),
    ).toMatchObject({ mode: 'tree', revision: '1', tree: emptyTree });
    await expect(
      service.activate('ideas', { expectedRevision: '0', tree: emptyTree }),
    ).rejects.toMatchObject({ response: { code: 'CONFLICT', mode: 'tree', revision: '1' } });
    await expect(
      service.save('ideas', { expectedRevision: '0', tree: emptyTree }),
    ).rejects.toMatchObject({ response: { code: 'CONFLICT', revision: '1' } });
    expect(await service.save('ideas', { expectedRevision: '1', tree: emptyTree })).toMatchObject({
      mode: 'tree',
      revision: '2',
    });
    expect(prisma.page.updateMany).toHaveBeenCalledTimes(2);
    expect(page.draftTreeRevision).toBe(2n);
  });

  it('loses a competing CAS without replacing the winning draft', async () => {
    const { service, prisma, page } = setup();
    prisma.page.updateMany.mockImplementationOnce(async () => {
      page.draftTree = emptyTree;
      page.draftTreeRevision = 1n;
      return { count: 0 };
    });
    await expect(
      service.activate('ideas', { expectedRevision: '0', tree: emptyTree }),
    ).rejects.toMatchObject({ response: { code: 'CONFLICT', mode: 'tree', revision: '1' } });
    expect(page.draftTree).toEqual(emptyTree);
    expect(page.draftTreeRevision).toBe(1n);
  });

  it.each([
    { ...emptyTree, schemaVersion: 99 },
    { ...emptyTree, root: { ...emptyTree.root, extra: 'must not strip' } },
    {
      ...emptyTree,
      root: {
        ...emptyTree.root,
        sections: [{ id: 'bad', type: 'unknown', responsive: { base: {} } }],
      },
    },
    {
      ...emptyTree,
      root: {
        ...emptyTree.root,
        sections: [
          {
            id: 's',
            type: 'section',
            responsive: { base: {} },
            content: [
              { id: 'c', type: 'component', componentType: 'nope', responsive: { base: {} } },
            ],
          },
        ],
      },
    },
  ])('rejects unsupported or unknown input before any write', async (tree) => {
    const { service, prisma, page } = setup();
    await expect(service.activate('ideas', { expectedRevision: '0', tree })).rejects.toMatchObject({
      response: { code: 'VALIDATION_FAILED', fieldErrors: { tree: expect.any(Array) } },
    });
    expect(prisma.page.updateMany).not.toHaveBeenCalled();
    expect(page.draftTreeRevision).toBe(0n);
  });

  it('blocks fixed pages and disabled publication without changing data', async () => {
    const { service, prisma } = setup();
    await expect(
      service.activate('home', { expectedRevision: '0', tree: emptyTree }),
    ).rejects.toMatchObject({ response: { code: 'CONFLICT' } });
    await service.activate('ideas', { expectedRevision: '0', tree: emptyTree });
    await expect(service.publish('ideas', { expectedRevision: '1' })).rejects.toMatchObject({
      response: { code: 'VALIDATION_FAILED', fieldErrors: { tree: expect.any(Array) } },
    });
    await service.save('ideas', { expectedRevision: '1', tree: publishReadyTree });
    await expect(service.publish('ideas', { expectedRevision: '2' })).rejects.toMatchObject({
      response: { code: 'CONFLICT', message: 'Tree publishing is not enabled' },
    });
    expect(prisma.page.updateMany).toHaveBeenCalledTimes(2);
  });

  it('rejects missing revisions and tree keys at the DTO boundary', () => {
    expect(builderDraftInputSchema.safeParse({ tree: emptyTree }).success).toBe(false);
    expect(builderDraftInputSchema.safeParse({ expectedRevision: '0' }).success).toBe(false);
    expect(
      builderDraftInputSchema.safeParse({ expectedRevision: '0', tree: emptyTree, hidden: 1 })
        .success,
    ).toBe(false);
  });
});
