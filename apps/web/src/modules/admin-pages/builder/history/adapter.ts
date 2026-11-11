import { commitTreeHistory, type TreeHistory, type TreeOperation } from '@parker2808/cms-core/tree';

import { reduceBuilderCommand, type BuilderCommand } from '../canvas/commands';
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

export function commitProperty(
  history: TreeHistory,
  operation: TreeOperation,
  typing = false,
): { history: TreeHistory; error?: string } {
  const result = commitTreeHistory(history, operation, {
    at: Date.now(),
    selectedId: history.selectedId,
    typing,
  });
  return result.ok ? { history: result.value } : { history, error: result.code };
}
