export type KeySequence = readonly [string, string];

export const SEQUENCE_TIMEOUT_MS = 1000;

export function ignoresShortcuts(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.closest('[role="dialog"], [role="alertdialog"]') !== null
  );
}

export function createSequenceListener<T extends string>(
  sequences: () => ReadonlyArray<{ id: T; keys: KeySequence }>,
  onMatch: (id: T) => void,
  timeoutMs = SEQUENCE_TIMEOUT_MS,
): (event: KeyboardEvent) => void {
  let first: string | null = null;
  let firstAt = 0;
  return (event) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.repeat ||
      ignoresShortcuts(event.target)
    ) {
      return;
    }
    const key = event.key.toLowerCase();
    const list = sequences();
    if (first !== null && event.timeStamp - firstAt <= timeoutMs) {
      const match = list.find(({ keys }) => keys[0] === first && keys[1] === key);
      if (match) {
        first = null;
        event.preventDefault();
        onMatch(match.id);
        return;
      }
    }
    first = list.some(({ keys }) => keys[0] === key) ? key : null;
    firstAt = event.timeStamp;
  };
}
