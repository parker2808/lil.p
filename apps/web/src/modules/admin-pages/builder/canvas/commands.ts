import { readTree, type TreeDocument, type TreeNode } from '@parker2808/cms-core/tree';

import {
  findNode,
  insertNode,
  moveNode,
  removeNode,
  reorderNode,
  type CompositionResult,
  type Destination,
} from './model';

export type BuilderState = { document: TreeDocument; selectedId: string };
export type BuilderCommand =
  | { type: 'insert'; node: TreeNode; destination: Destination }
  | { type: 'move'; id: string; destination: Destination }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; id: string; direction: -1 | 1 }
  | { type: 'select'; id: string }
  | { type: 'replace'; document: TreeDocument; selectedId: string };

export function reduceBuilderCommand(
  state: BuilderState,
  command: BuilderCommand,
): CompositionResult {
  const { document } = state;
  switch (command.type) {
    case 'insert':
      return insertNode(document, command.node, command.destination);
    case 'move':
      return moveNode(document, command.id, command.destination);
    case 'remove':
      return removeNode(document, command.id);
    case 'reorder':
      return reorderNode(document, command.id, command.direction);
    case 'select':
      return findNode(document, command.id)
        ? { ok: true, document, selectedId: command.id }
        : { ok: false, document, reason: 'NOT_FOUND' };
    case 'replace': {
      const draft = readTree(command.document);
      return draft.ok && findNode(draft.value, command.selectedId)
        ? { ok: true, document: draft.value, selectedId: command.selectedId }
        : { ok: false, document, reason: 'INVALID_TREE' };
    }
  }
}
