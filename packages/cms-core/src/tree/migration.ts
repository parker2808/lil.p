import { legacyTreeDocumentSchema, TREE_LIMITS, type TreeDocument, type TreeNode } from './schema';
import { type ComponentRegistry, readTree, serializedBytes, type TreeResult } from './validation';

function upgradeNode(node: Record<string, unknown>): TreeNode {
  const { props, ...fields } = node;
  const upgraded = { ...fields, responsive: { base: props } } as TreeNode;
  for (const slot of ['sections', 'content', 'columns', 'items'] as const) {
    const children = node[slot];
    if (Array.isArray(children))
      upgraded[slot] = children.map((child) => upgradeNode(child)) as TreeNode[];
  }
  return upgraded;
}

export function migrateTree(
  input: unknown,
  registry: ComponentRegistry = {},
): TreeResult<TreeDocument> {
  const bytes = serializedBytes(input);
  if (bytes === undefined || bytes > TREE_LIMITS.bytes)
    return { ok: false, code: 'TREE_LIMIT', input };
  if (!input || typeof input !== 'object' || !('schemaVersion' in input)) {
    return { ok: false, code: 'INVALID_TREE', input };
  }
  if (input.schemaVersion === 1) return readTree(input, registry);
  if (input.schemaVersion !== 0) return { ok: false, code: 'UNSUPPORTED_VERSION', input };
  const parsed = legacyTreeDocumentSchema.safeParse(input);
  if (!parsed.success || !sameShape(input, parsed.data))
    return { ok: false, code: 'INVALID_TREE', input };
  const candidate = {
    schemaVersion: 1,
    root: upgradeNode(parsed.data.root as Record<string, unknown>),
  };
  const result = readTree(candidate, registry);
  return result.ok ? result : { ...result, input };
}

function sameShape(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => sameShape(value, right[index]))
    );
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const first = Object.keys(left).sort();
    const second = Object.keys(right).sort();
    return (
      first.length === second.length &&
      first.every(
        (key, index) =>
          key === second[index] &&
          sameShape(
            (left as Record<string, unknown>)[key],
            (right as Record<string, unknown>)[key],
          ),
      )
    );
  }
  return Object.is(left, right);
}
