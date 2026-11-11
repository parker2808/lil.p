import type { ResponsiveProps, TreeDocument, TreeNode } from './schema';
import { type ComponentRegistry, readTree, type TreeResult } from './validation';

export type Breakpoint = 'base' | 'mobile' | 'tablet' | 'desktop';
type Slot = 'sections' | 'content' | 'columns' | 'items';
export type TreeOperation =
  | { kind: 'insert'; parentId: string; slot: Slot; index: number; node: TreeNode }
  | { kind: 'move'; nodeId: string; parentId: string; slot: Slot; index: number }
  | { kind: 'delete'; nodeId: string }
  | {
      kind: 'duplicate';
      nodeId: string;
      allocateId: () => string;
    }
  | {
      kind: 'property';
      nodeId: string;
      breakpoint: Breakpoint;
      key: string;
      value: ResponsiveProps['base'][string];
    }
  | {
      kind: 'clear-override';
      nodeId: string;
      breakpoint: Exclude<Breakpoint, 'base'>;
      key: string;
    };

type Container = { parent: TreeNode; slot: Slot; children: TreeNode[]; index: number };
export const cloneTreeValue = <Value>(value: Value): Value =>
  JSON.parse(JSON.stringify(value)) as Value;

function childrenOf(node: TreeNode): { slot: Slot; children: TreeNode[] } | undefined {
  if (node.type === 'page') return { slot: 'sections', children: node.sections };
  if (node.type === 'section' || node.type === 'column')
    return { slot: 'content', children: node.content };
  if (node.type === 'row') return { slot: 'columns', children: node.columns };
  if (node.type === 'grid') return { slot: 'items', children: node.items };
}

function find(root: TreeNode, id: string): { node: TreeNode; container?: Container } | undefined {
  const stack: { node: TreeNode; container?: Container }[] = [{ node: root }];
  while (stack.length) {
    const current = stack.pop()!;
    if (current.node.id === id) return current;
    const slot = childrenOf(current.node);
    if (slot) {
      for (let index = slot.children.length - 1; index >= 0; index--) {
        stack.push({
          node: slot.children[index]!,
          container: { parent: current.node, slot: slot.slot, children: slot.children, index },
        });
      }
    }
  }
}

function invalid(document: TreeDocument): TreeResult<TreeDocument> {
  return { ok: false, code: 'INVALID_SLOT', input: document };
}

export function applyTreeOperation(
  document: TreeDocument,
  operation: TreeOperation,
  registry: ComponentRegistry,
): TreeResult<TreeDocument> {
  if (!registry || typeof registry !== 'object')
    throw new TypeError('Component registry is required');
  const source = readTree(document, registry);
  if (!source.ok) return source;
  const candidate = cloneTreeValue(source.value);
  const target = 'nodeId' in operation ? find(candidate.root, operation.nodeId) : undefined;
  if (
    'nodeId' in operation &&
    (!target ||
      (target.node.type === 'page' &&
        operation.kind !== 'property' &&
        operation.kind !== 'clear-override'))
  )
    return invalid(document);

  if (operation.kind === 'property' || operation.kind === 'clear-override') {
    if (
      !target ||
      typeof operation.key !== 'string' ||
      !operation.key ||
      !['base', 'mobile', 'tablet', 'desktop'].includes(operation.breakpoint) ||
      ['__proto__', 'constructor', 'prototype'].includes(operation.key)
    )
      return invalid(document);
    const responsive = target.node.responsive;
    if (operation.kind === 'property') {
      if (operation.breakpoint === 'base') responsive.base[operation.key] = operation.value;
      else
        responsive[operation.breakpoint] = {
          ...responsive[operation.breakpoint],
          [operation.key]: operation.value,
        };
    } else if (responsive[operation.breakpoint]) {
      const override = { ...responsive[operation.breakpoint] };
      delete override[operation.key];
      if (Object.keys(override).length) responsive[operation.breakpoint] = override;
      else delete responsive[operation.breakpoint];
    }
  } else if (operation.kind === 'delete') {
    if (!target?.container) return invalid(document);
    target.container.children.splice(target.container.index, 1);
  } else if (operation.kind === 'duplicate') {
    if (!target?.container) return invalid(document);
    const copy = cloneTreeValue(target.node);
    const existing = new Set<string>();
    const stack: TreeNode[] = [candidate.root];
    while (stack.length) {
      const node = stack.pop()!;
      existing.add(node.id);
      stack.push(...(childrenOf(node)?.children ?? []));
    }
    const copies: TreeNode[] = [copy];
    while (copies.length) {
      const node = copies.pop()!;
      let id: string;
      try {
        id = operation.allocateId();
      } catch {
        return invalid(document);
      }
      if (typeof id !== 'string' || existing.has(id)) return invalid(document);
      existing.add(id);
      node.id = id;
      copies.push(...(childrenOf(node)?.children ?? []));
    }
    target.container.children.splice(target.container.index + 1, 0, copy);
  } else {
    let moved: TreeNode;
    if (operation.kind === 'move') {
      if (!target?.container) return invalid(document);
      moved = target.container.children.splice(target.container.index, 1)[0]!;
    } else {
      moved = operation.node;
    }
    const parent = find(candidate.root, operation.parentId)?.node;
    const slot = parent && childrenOf(parent);
    if (
      !slot ||
      slot.slot !== operation.slot ||
      !Number.isInteger(operation.index) ||
      operation.index < 0 ||
      operation.index > slot.children.length
    )
      return invalid(document);
    slot.children.splice(operation.index, 0, moved);
  }
  const result = readTree(candidate, registry);
  return result.ok ? result : { ...result, input: document };
}

export type HistoryEntry = {
  before: TreeDocument;
  after: TreeDocument;
  beforeSelection?: string;
  afterSelection?: string;
  typingKey?: string;
  at: number;
};
export type TreeHistory = {
  document: TreeDocument;
  selectedId?: string;
  past: HistoryEntry[];
  future: HistoryEntry[];
};

export function createTreeHistory(document: TreeDocument, selectedId?: string): TreeHistory {
  return { document: cloneTreeValue(document), selectedId, past: [], future: [] };
}

export function commitTreeHistory(
  history: TreeHistory,
  operation: TreeOperation,
  options: { selectedId?: string; at: number; typing?: boolean; limit?: number },
  registry: ComponentRegistry,
): TreeResult<TreeHistory> {
  const result = applyTreeOperation(history.document, operation, registry);
  if (!result.ok) return result;
  if (JSON.stringify(result.value) === JSON.stringify(history.document))
    return { ok: true, value: history };
  const typingKey =
    options.typing && operation.kind === 'property'
      ? `${operation.nodeId}/${operation.breakpoint}/${operation.key}`
      : undefined;
  const last = history.past.at(-1);
  const coalesce = Boolean(
    typingKey &&
    last?.typingKey === typingKey &&
    options.at >= last.at &&
    options.at - last.at <= 600 &&
    history.future.length === 0,
  );
  const entry: HistoryEntry = {
    before: coalesce ? last!.before : history.document,
    after: result.value,
    beforeSelection: coalesce ? last!.beforeSelection : history.selectedId,
    afterSelection: options.selectedId,
    typingKey,
    at: options.at,
  };
  const limit = Math.max(1, Math.min(500, options.limit ?? 50));
  return {
    ok: true,
    value: {
      document: result.value,
      selectedId: options.selectedId,
      past: [...(coalesce ? history.past.slice(0, -1) : history.past), entry].slice(-limit),
      future: [],
    },
  };
}

export function undoTreeHistory(history: TreeHistory): TreeHistory {
  const entry = history.past.at(-1);
  if (!entry) return history;
  return {
    document: entry.before,
    selectedId: entry.beforeSelection,
    past: history.past.slice(0, -1),
    future: [entry, ...history.future],
  };
}

export function endTreeTyping(history: TreeHistory): TreeHistory {
  const last = history.past.at(-1);
  if (!last?.typingKey) return history;
  return { ...history, past: [...history.past.slice(0, -1), { ...last, typingKey: undefined }] };
}

export function redoTreeHistory(history: TreeHistory): TreeHistory {
  const [entry, ...future] = history.future;
  if (!entry) return history;
  return {
    document: entry.after,
    selectedId: entry.afterSelection,
    past: [...history.past, entry],
    future,
  };
}
