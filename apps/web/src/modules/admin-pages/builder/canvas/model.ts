import {
  readTree,
  TREE_LIMITS,
  treeIdSchema,
  type ComponentRegistry,
  type TreeDocument,
  type TreeNode,
} from '@parker2808/cms-core/tree';

export type Slot = 'sections' | 'content' | 'columns' | 'items';
export type Destination = { parentId: string; slot: Slot; index: number };
export type CompositionError =
  'NOT_FOUND' | 'INVALID_TARGET' | 'INVALID_ID' | 'INVALID_TREE' | 'REQUIRED_COLUMN';
export type CompositionResult =
  | { ok: true; document: TreeDocument; selectedId: string }
  | { ok: false; document: TreeDocument; reason: CompositionError };

export function children(node: TreeNode): TreeNode[] {
  switch (node.type) {
    case 'page':
      return node.sections;
    case 'section':
    case 'column':
      return node.content;
    case 'row':
      return node.columns;
    case 'grid':
      return node.items;
    default:
      return [];
  }
}

export function findNode(document: TreeDocument, id: string): TreeNode | undefined {
  const stack: TreeNode[] = [document.root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.id === id) return node;
    stack.push(...children(node));
  }
}

export type OutlineItem = { id: string; parentId?: string; depth: number; node: TreeNode };

export function outline(document: TreeDocument): OutlineItem[] {
  const items: OutlineItem[] = [];
  function visit(node: TreeNode, depth: number, parentId?: string) {
    items.push({ id: node.id, parentId, depth, node });
    for (const child of children(node)) visit(child, depth + 1, node.id);
  }
  visit(document.root, 0);
  return items;
}

function slotChildren(node: TreeNode, slot: Slot): TreeNode[] | undefined {
  if (node.type === 'page' && slot === 'sections') return node.sections;
  if ((node.type === 'section' || node.type === 'column') && slot === 'content')
    return node.content;
  if (node.type === 'row' && slot === 'columns') return node.columns;
  if (node.type === 'grid' && slot === 'items') return node.items;
}

function allowed(parent: TreeNode, slot: Slot, node: TreeNode): boolean {
  if (parent.type === 'page') return slot === 'sections' && node.type === 'section';
  if (parent.type === 'section')
    return (
      slot === 'content' && ['component', 'legacy-component', 'row', 'grid'].includes(node.type)
    );
  if (parent.type === 'row') return slot === 'columns' && node.type === 'column';
  if (parent.type === 'column' || parent.type === 'grid')
    return (
      (parent.type === 'grid' ? slot === 'items' : slot === 'content') &&
      ['component', 'legacy-component'].includes(node.type)
    );
  return false;
}

function locate(document: TreeDocument, id: string) {
  for (const item of outline(document)) {
    if (item.id !== id || !item.parentId) continue;
    const parent = findNode(document, item.parentId)!;
    const slot = (['sections', 'content', 'columns', 'items'] as const).find((key) =>
      slotChildren(parent, key)?.some((child) => child.id === id),
    )!;
    return {
      parent,
      slot,
      index: slotChildren(parent, slot)!.findIndex((child) => child.id === id),
    };
  }
}

export function validDestinations(
  document: TreeDocument,
  nodeId: string,
  registry?: ComponentRegistry,
): Destination[] {
  const node = findNode(document, nodeId);
  if (!node || node.type === 'page') return [];
  const result: Destination[] = [];
  for (const item of outline(document)) {
    for (const slot of ['sections', 'content', 'columns', 'items'] as const) {
      const target = slotChildren(item.node, slot);
      if (!target || !allowed(item.node, slot, node)) continue;
      for (let index = 0; index <= target.length; index++) {
        const destination = { parentId: item.id, slot, index };
        if (moveNode(document, nodeId, destination, registry).ok) result.push(destination);
      }
    }
  }
  return result;
}

function finish(
  original: TreeDocument,
  draft: TreeDocument,
  selectedId: string,
  registry?: ComponentRegistry,
): CompositionResult {
  const result = readTree(draft, registry);
  return result.ok
    ? { ok: true, document: result.value, selectedId }
    : { ok: false, document: original, reason: 'INVALID_TREE' };
}

export function insertNode(
  document: TreeDocument,
  node: TreeNode,
  destination: Destination,
  registry?: ComponentRegistry,
): CompositionResult {
  if (outline({ schemaVersion: 1, root: node as TreeDocument['root'] }).length > TREE_LIMITS.nodes)
    return { ok: false, document, reason: 'INVALID_TREE' };
  if (
    outline({ schemaVersion: 1, root: node as TreeDocument['root'] }).some(
      (item) => !treeIdSchema.safeParse(item.id).success || !!findNode(document, item.id),
    )
  )
    return { ok: false, document, reason: 'INVALID_ID' };
  const draft = structuredClone(document);
  const parent = findNode(draft, destination.parentId);
  const target = parent && slotChildren(parent, destination.slot);
  if (
    !parent ||
    !target ||
    !allowed(parent, destination.slot, node) ||
    destination.index < 0 ||
    destination.index > target.length ||
    !Number.isInteger(destination.index)
  )
    return { ok: false, document, reason: 'INVALID_TARGET' };
  target.splice(destination.index, 0, structuredClone(node));
  return finish(document, draft, node.id, registry);
}

export function moveNode(
  document: TreeDocument,
  nodeId: string,
  destination: Destination,
  registry?: ComponentRegistry,
): CompositionResult {
  const draft = structuredClone(document);
  const source = locate(draft, nodeId);
  const parent = findNode(draft, destination.parentId);
  const target = parent && slotChildren(parent, destination.slot);
  if (!source) return { ok: false, document, reason: 'NOT_FOUND' };
  const node = slotChildren(source.parent, source.slot)![source.index]!;
  const targetAncestors = new Set<string>();
  let ancestorId: string | undefined = destination.parentId;
  const sourceOutline = outline(draft);
  while (ancestorId) {
    targetAncestors.add(ancestorId);
    ancestorId = sourceOutline.find((item) => item.id === ancestorId)?.parentId;
  }
  if (
    !parent ||
    !target ||
    !allowed(parent, destination.slot, node) ||
    destination.index < 0 ||
    destination.index > target.length ||
    !Number.isInteger(destination.index) ||
    targetAncestors.has(nodeId)
  )
    return { ok: false, document, reason: 'INVALID_TARGET' };
  slotChildren(source.parent, source.slot)!.splice(source.index, 1);
  const nextIndex =
    source.parent.id === parent.id &&
    source.slot === destination.slot &&
    source.index < destination.index
      ? destination.index - 1
      : destination.index;
  slotChildren(parent, destination.slot)!.splice(nextIndex, 0, node);
  return finish(document, draft, nodeId, registry);
}

export function removeNode(
  document: TreeDocument,
  nodeId: string,
  registry?: ComponentRegistry,
): CompositionResult {
  const draft = structuredClone(document);
  const source = locate(draft, nodeId);
  if (!source) return { ok: false, document, reason: 'NOT_FOUND' };
  if (source.parent.type === 'row' && source.parent.columns.length <= 2)
    return { ok: false, document, reason: 'REQUIRED_COLUMN' };
  slotChildren(source.parent, source.slot)!.splice(source.index, 1);
  return finish(document, draft, source.parent.id, registry);
}

export function reorderNode(
  document: TreeDocument,
  nodeId: string,
  direction: -1 | 1,
  registry?: ComponentRegistry,
): CompositionResult {
  const source = locate(document, nodeId);
  if (!source) return { ok: false, document, reason: 'NOT_FOUND' };
  const next = source.index + direction;
  if (next < 0 || next >= slotChildren(source.parent, source.slot)!.length)
    return { ok: false, document, reason: 'INVALID_TARGET' };
  return moveNode(
    document,
    nodeId,
    { parentId: source.parent.id, slot: source.slot, index: direction === 1 ? next + 1 : next },
    registry,
  );
}
