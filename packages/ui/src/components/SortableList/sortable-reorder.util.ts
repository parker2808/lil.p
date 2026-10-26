export function applySortableReorder(
  ids: readonly string[],
  activeId: string,
  overId: string,
  lockedIds: ReadonlySet<string>,
): string[] | null {
  if (activeId === overId) {
    return null;
  }
  if (lockedIds.has(activeId) || lockedIds.has(overId)) {
    return null;
  }
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from < 0 || to < 0) {
    return null;
  }
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) {
    return null;
  }
  next.splice(to, 0, moved);
  for (const locked of lockedIds) {
    if (ids.indexOf(locked) !== next.indexOf(locked)) {
      return null;
    }
  }
  return next;
}
