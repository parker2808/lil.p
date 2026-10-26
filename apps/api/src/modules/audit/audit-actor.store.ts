import { AsyncLocalStorage } from 'node:async_hooks';

type AuditActorStore = { userId: number | null };

export const auditActor = new AsyncLocalStorage<AuditActorStore>();

export function currentAuditUserId(): number | null {
  return auditActor.getStore()?.userId ?? null;
}
