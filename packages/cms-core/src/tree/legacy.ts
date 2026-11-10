import { pageSnapshotBlockSchema, pageSnapshotSeoSchema } from '../contracts';
import { TREE_LIMITS, type TreeDocument, type TreeNode } from './schema';
import { readTree, serializedBytes, type TreeResult } from './validation';

export type LegacyConversion = { tree: TreeDocument; seo: unknown };

export function convertLegacySnapshot(input: unknown): TreeResult<LegacyConversion> {
  const bytes = serializedBytes(input);
  if (bytes === undefined || bytes > TREE_LIMITS.bytes)
    return { ok: false, code: 'TREE_LIMIT', input };
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return { ok: false, code: 'INVALID_TREE', input };
  const snapshot = input as Record<string, unknown>;
  if (
    Object.keys(snapshot).sort().join(',') !== 'blocks,seo' ||
    !pageSnapshotSeoSchema.strict().safeParse(snapshot.seo).success ||
    !Array.isArray(snapshot.blocks)
  ) {
    return { ok: false, code: 'INVALID_TREE', input };
  }
  const sections: TreeNode[] = [];
  const keys = new Set<string>();
  for (const block of snapshot.blocks) {
    if (
      !pageSnapshotBlockSchema.safeParse(block).success ||
      !block ||
      typeof block !== 'object' ||
      Array.isArray(block)
    )
      return { ok: false, code: 'INVALID_TREE', input };
    const raw = block as Record<string, unknown>;
    if (keys.has(raw.key as string)) return { ok: false, code: 'DUPLICATE_ID', input };
    keys.add(raw.key as string);
    sections.push({
      id: `legacy-section-${raw.key}`,
      type: 'section',
      responsive: { base: {} },
      content: [
        {
          id: `legacy-component-${raw.key}`,
          type: 'legacy-component',
          responsive: { base: { block: raw as TreeNode['responsive']['base']['block'] } },
        },
      ],
    });
  }
  const tree: TreeDocument = {
    schemaVersion: 1,
    root: { id: 'legacy-page', type: 'page', responsive: { base: {} }, sections },
  };
  const validated = readTree(tree);
  if (!validated.ok) return { ...validated, input };
  return { ok: true, value: { tree: validated.value, seo: snapshot.seo } };
}
