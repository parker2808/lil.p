import { readTree, serializedBytes, type TreeDocument } from '@parker2808/cms-core/tree';

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function recoveryKey(userId: number, pageKey: string): string {
  return `cms-builder-recovery:${userId}:${pageKey}`;
}

export function readRecovery(key: string): TreeDocument | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('at' in data) || !('tree' in data)) return;
    if (typeof data.at !== 'number' || Date.now() - data.at > MAX_AGE_MS || data.at > Date.now()) {
      localStorage.removeItem(key);
      return;
    }
    const parsed = readTree(data.tree);
    return parsed.ok ? parsed.value : undefined;
  } catch {
    return;
  }
}

export function writeRecovery(key: string, tree: TreeDocument): boolean {
  if (!readTree(tree).ok || (serializedBytes(tree) ?? Infinity) > 256 * 1024) return false;
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), tree }));
    return true;
  } catch {
    return false;
  }
}

export function clearRecovery(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}
