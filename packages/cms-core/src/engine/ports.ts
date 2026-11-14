import type { PageKey, PageSnapshot } from '../contracts';

export interface PageRepository<Page, Version> {
  getPage(key: PageKey): Promise<Page | null>;
  getVersion(key: PageKey, version: number): Promise<Version | null>;
  saveVersion(key: PageKey, snapshot: PageSnapshot): Promise<Version>;
  setPublishedVersion(key: PageKey, version: Version): Promise<void>;
}

export interface AuthorizationPolicy<Actor> {
  canEdit(actor: Actor, pageKey: PageKey): boolean | Promise<boolean>;
  canPublish(actor: Actor, pageKey: PageKey): boolean | Promise<boolean>;
}

export interface MediaResolver<Media> {
  resolve(kind: string, id: number): Promise<Media | null>;
}

export interface AuditWriter<Actor> {
  record(actor: Actor, action: string, pageKey: PageKey): Promise<void>;
}

export interface CacheInvalidator {
  invalidate(pageKey: PageKey): Promise<void>;
}
