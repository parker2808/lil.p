import { cloneTreeValue } from './editing';
import type { TreeDocument } from './schema';
import { type ComponentRegistry, readTree, type TreeResult } from './validation';

export type DraftSnapshot = { tree: TreeDocument; revision: string };
export type DraftTransport = {
  save: (draft: { tree: TreeDocument; expectedRevision: string }) => Promise<DraftSnapshot>;
  read: () => Promise<DraftSnapshot>;
};
export type DraftScheduler = {
  schedule: (callback: () => void, delay: number) => unknown;
  cancel: (handle: unknown) => void;
};
export type AutosaveStatus = 'saved' | 'dirty' | 'saving' | 'conflict' | 'review' | 'invalid';
export type AutosaveState = {
  local: TreeDocument;
  acknowledged: DraftSnapshot;
  remote?: DraftSnapshot;
  status: AutosaveStatus;
};

const revisionPattern = /^(0|[1-9]\d*)$/;
const canonical = (value: TreeDocument) =>
  JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([left], [right]) => left.localeCompare(right)),
        )
      : item,
  );
const same = (left: TreeDocument, right: TreeDocument) => canonical(left) === canonical(right);

export class DraftAutosave {
  private current: AutosaveState;
  private timer?: unknown;
  private request?: Promise<void>;
  private lastAttempt?: TreeDocument;
  private disposed = false;
  private reviewTimer?: unknown;
  private reviewDelay = 1000;

  constructor(
    initial: DraftSnapshot,
    private readonly transport: DraftTransport,
    private readonly scheduler: DraftScheduler,
    private readonly registry: ComponentRegistry = {},
    private readonly debounceMs = 500,
  ) {
    const valid = readTree(initial.tree, registry);
    if (!valid.ok || !revisionPattern.test(initial.revision))
      throw new Error('Invalid draft snapshot');
    this.current = {
      local: cloneTreeValue(initial.tree),
      acknowledged: cloneTreeValue(initial),
      status: 'saved',
    };
  }

  get state(): AutosaveState {
    return cloneTreeValue(this.current);
  }

  edit(document: TreeDocument): TreeResult<TreeDocument> {
    const result = readTree(document, this.registry);
    if (!result.ok) return result;
    if (this.disposed) return { ok: false, code: 'INVALID_TREE', input: document };
    this.current.local = cloneTreeValue(result.value);
    if (
      this.current.status !== 'conflict' &&
      this.current.status !== 'review' &&
      this.current.status !== 'invalid'
    ) {
      this.current.status = same(this.current.local, this.current.acknowledged.tree)
        ? 'saved'
        : 'dirty';
      if (this.current.status === 'dirty') this.queue();
      else this.clearTimer();
    }
    return result;
  }

  private clearTimer(): void {
    if (this.timer !== undefined) this.scheduler.cancel(this.timer);
    this.timer = undefined;
  }

  private queue(): void {
    this.clearTimer();
    if (this.request || this.disposed) return;
    this.timer = this.scheduler.schedule(() => {
      this.timer = undefined;
      void this.flush();
    }, this.debounceMs);
  }

  private scheduleDirty(): void {
    if (this.current.status === 'dirty') this.queue();
  }

  async flush(): Promise<void> {
    this.clearTimer();
    if (this.disposed || this.request || this.current.status !== 'dirty') return;
    const attempted = cloneTreeValue(this.current.local);
    const revision = this.current.acknowledged.revision;
    this.lastAttempt = attempted;
    this.current.status = 'saving';
    const request = (async () => {
      try {
        const response = await this.transport.save({ tree: attempted, expectedRevision: revision });
        if (this.disposed) return;
        if (
          !revisionPattern.test(response.revision) ||
          !same(response.tree, attempted) ||
          !readTree(response.tree, this.registry).ok
        ) {
          this.current.status = 'review';
          return;
        }
        this.current.acknowledged = cloneTreeValue(response);
        this.lastAttempt = undefined;
        this.current.remote = undefined;
        this.current.status = same(this.current.local, attempted) ? 'saved' : 'dirty';
      } catch (error) {
        if (this.disposed) return;
        const status = (error as { status?: number })?.status;
        this.current.status = status === 409 ? 'conflict' : status === 400 ? 'invalid' : 'review';
      }
    })();
    this.request = request;
    await request;
    this.request = undefined;
    this.scheduleDirty();
  }

  async review(): Promise<DraftSnapshot | undefined> {
    this.clearTimer();
    if (this.reviewTimer !== undefined) this.scheduler.cancel(this.reviewTimer);
    this.reviewTimer = undefined;
    if (this.request) await this.request;
    if (this.disposed || !['review', 'conflict', 'invalid'].includes(this.current.status)) return;
    try {
      const remote = await this.transport.read();
      if (this.disposed) return;
      if (!revisionPattern.test(remote.revision) || !readTree(remote.tree, this.registry).ok)
        return;
      this.current.remote = cloneTreeValue(remote);
      this.reviewDelay = 1000;
      return cloneTreeValue(remote);
    } catch {
      if (!this.disposed) {
        const delay = this.reviewDelay;
        this.reviewDelay = Math.min(this.reviewDelay * 2, 30000);
        this.reviewTimer = this.scheduler.schedule(() => {
          this.reviewTimer = undefined;
          void this.review();
        }, delay);
      }
      return;
    }
  }

  resolveReviewed(choice: 'acknowledge' | 'reload'): boolean {
    if (this.disposed || !this.current.remote || this.request) return false;
    const remote = this.current.remote;
    if (
      choice === 'acknowledge' &&
      !same(remote.tree, this.lastAttempt ?? this.current.local) &&
      !same(remote.tree, this.current.acknowledged.tree)
    )
      return false;
    if (choice === 'reload') this.current.local = cloneTreeValue(remote.tree);
    this.current.acknowledged = cloneTreeValue(remote);
    this.lastAttempt = undefined;
    this.current.remote = undefined;
    this.current.status = same(this.current.local, remote.tree) ? 'saved' : 'dirty';
    if (this.current.status === 'dirty') this.queue();
    return true;
  }

  dispose(): void {
    this.disposed = true;
    this.clearTimer();
    if (this.reviewTimer !== undefined) this.scheduler.cancel(this.reviewTimer);
    this.reviewTimer = undefined;
  }
}
