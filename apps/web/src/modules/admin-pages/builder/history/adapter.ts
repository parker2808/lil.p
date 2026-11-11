import { commitTreeHistory, type TreeHistory, type TreeOperation } from '@parker2808/cms-core/tree';

import { reduceBuilderCommand, type BuilderCommand } from '../canvas/commands';
import { findNode, outline, type Slot } from '../canvas/model';
import { builderRegistry } from '../properties/registry';
import type { CompositionResult } from '../canvas/model';

export function commitComposition(
  history: TreeHistory,
  command: BuilderCommand,
): { result: CompositionResult; history: TreeHistory } {
  const state = { document: history.document, selectedId: history.selectedId ?? 'page' };
  const result = reduceBuilderCommand(state, command);
  if (!result.ok) return { result, history };
  if (command.type === 'select')
    return { result, history: { ...history, selectedId: result.selectedId } };
  if (JSON.stringify(result.document) === JSON.stringify(history.document))
    return { result, history };
  if (command.type !== 'replace') {
    const operation = compositionOperation(history, command);
    if (!operation)
      return {
        result: { ok: false, document: history.document, reason: 'INVALID_TARGET' },
        history,
      };
    const committed = commitTreeHistory(
      history,
      operation,
      { at: Date.now(), selectedId: result.selectedId },
      builderRegistry,
    );
    if (
      !committed.ok ||
      JSON.stringify(committed.value.document) !== JSON.stringify(result.document)
    )
      return { result: { ok: false, document: history.document, reason: 'INVALID_TREE' }, history };
    return {
      result: { ok: true, document: committed.value.document, selectedId: result.selectedId },
      history: committed.value,
    };
  }
  return {
    result,
    history: {
      document: result.document,
      selectedId: result.selectedId,
      past: [
        ...history.past,
        {
          before: history.document,
          after: result.document,
          beforeSelection: history.selectedId,
          afterSelection: result.selectedId,
          at: Date.now(),
        },
      ].slice(-50),
      future: [],
    },
  };
}

function compositionOperation(
  history: TreeHistory,
  command: Exclude<BuilderCommand, { type: 'select' | 'replace' }>,
): TreeOperation | undefined {
  if (command.type === 'insert')
    return {
      kind: 'insert',
      node: command.node,
      parentId: command.destination.parentId,
      slot: command.destination.slot,
      index: command.destination.index,
    };
  if (command.type === 'remove') return { kind: 'delete', nodeId: command.id };
  const item = outline(history.document).find((entry) => entry.id === command.id);
  if (!item?.parentId) return undefined;
  const parent = findNode(history.document, item.parentId);
  if (!parent) return undefined;
  const slot: Slot =
    parent.type === 'page'
      ? 'sections'
      : parent.type === 'row'
        ? 'columns'
        : parent.type === 'grid'
          ? 'items'
          : 'content';
  const siblings =
    parent.type === 'page'
      ? parent.sections
      : parent.type === 'row'
        ? parent.columns
        : parent.type === 'grid'
          ? parent.items
          : parent.type === 'section' || parent.type === 'column'
            ? parent.content
            : [];
  const sourceIndex = siblings.findIndex((sibling) => sibling.id === command.id);
  if (sourceIndex < 0) return undefined;
  if (command.type === 'reorder')
    return {
      kind: 'move',
      nodeId: command.id,
      parentId: item.parentId,
      slot,
      index: sourceIndex + command.direction,
    };
  const { destination } = command;
  return {
    kind: 'move',
    nodeId: command.id,
    parentId: destination.parentId,
    slot: destination.slot,
    index:
      item.parentId === destination.parentId &&
      slot === destination.slot &&
      sourceIndex < destination.index
        ? destination.index - 1
        : destination.index,
  };
}

export function commitProperty(
  history: TreeHistory,
  operation: TreeOperation,
  typing = false,
): { history: TreeHistory; error?: string } {
  const result = commitTreeHistory(
    history,
    operation,
    {
      at: Date.now(),
      selectedId: history.selectedId,
      typing,
    },
    builderRegistry,
  );
  return result.ok ? { history: result.value } : { history, error: result.code };
}
