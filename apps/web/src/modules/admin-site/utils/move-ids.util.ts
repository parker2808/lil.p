export function moveIds(ids: number[], id: number, direction: -1 | 1): number[] {
  const index = ids.indexOf(id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= ids.length) {
    return ids;
  }
  const copy = [...ids];
  const current = copy[index];
  const swap = copy[next];
  if (current === undefined || swap === undefined) {
    return ids;
  }
  copy[index] = swap;
  copy[next] = current;
  return copy;
}
