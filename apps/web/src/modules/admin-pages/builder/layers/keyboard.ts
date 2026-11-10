import type { TreeDocument } from '@parker2808/cms-core/tree';

import { children, outline, type OutlineItem } from '../canvas/model';

export function visibleOutline(
  document: TreeDocument,
  expanded: ReadonlySet<string>,
): OutlineItem[] {
  const visible: OutlineItem[] = [];
  for (const item of outline(document)) {
    if (
      !item.parentId ||
      visible.some((parent) => parent.id === item.parentId && expanded.has(parent.id))
    )
      visible.push(item);
  }
  return visible;
}

export type Navigation = { focusId: string; expanded: Set<string> };

export function navigateOutline(
  document: TreeDocument,
  expanded: ReadonlySet<string>,
  focusId: string,
  key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End',
  rtl = false,
): Navigation {
  const items = visibleOutline(document, expanded);
  const index = items.findIndex((item) => item.id === focusId);
  const current = items[index];
  const nextExpanded = new Set(expanded);
  if (!current) return { focusId: items[0]?.id ?? focusId, expanded: nextExpanded };
  if (key === 'Home') return { focusId: items[0]!.id, expanded: nextExpanded };
  if (key === 'End') return { focusId: items.at(-1)!.id, expanded: nextExpanded };
  if (key === 'ArrowUp' || key === 'ArrowDown')
    return {
      focusId:
        items[Math.max(0, Math.min(items.length - 1, index + (key === 'ArrowDown' ? 1 : -1)))]!.id,
      expanded: nextExpanded,
    };
  const forward = key === (rtl ? 'ArrowLeft' : 'ArrowRight');
  if (forward) {
    if (children(current.node).length && !expanded.has(focusId)) nextExpanded.add(focusId);
    else if (children(current.node).length) focusId = children(current.node)[0]!.id;
  } else if (expanded.has(focusId) && children(current.node).length) nextExpanded.delete(focusId);
  else if (current.parentId) focusId = current.parentId;
  return { focusId, expanded: nextExpanded };
}
