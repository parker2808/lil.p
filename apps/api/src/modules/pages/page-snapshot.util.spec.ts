import { describe, expect, it } from 'vitest';

import { readTreeVersionSnapshot } from './page-snapshot.util';

describe('tree version snapshots', () => {
  it('retains a valid opaque legacy node for admin recovery but rejects it for rendering', () => {
    const tree = {
      schemaVersion: 1,
      root: {
        id: 'page',
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: 'section',
            type: 'section',
            responsive: { base: {} },
            content: [
              {
                id: 'legacy',
                type: 'legacy-component',
                responsive: {
                  base: { block: { type: 'future-block', props: { nested: { keep: 'raw' } } } },
                },
              },
            ],
          },
        ],
      },
    };
    const snapshot = {
      format: 'tree',
      snapshotVersion: 1,
      seo: {
        seoTitleEn: 'Stored',
        seoTitleVi: null,
        seoDescriptionEn: null,
        seoDescriptionVi: null,
      },
      tree,
    };

    expect(readTreeVersionSnapshot(snapshot)).toBeNull();
    expect(readTreeVersionSnapshot(snapshot, true)?.tree).toEqual(tree);
  });
});
