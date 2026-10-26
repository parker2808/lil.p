import type { Locale } from '../common/locale.schema';
import type { PageKey } from '../pages/pages.enum';

type Entity = string;
type ListParams = Record<string, unknown>;

/** One factory so invalidation stays predictable (spec §4.6). */
export const qk = {
  public: {
    site: (locale: Locale) => ['public', 'site', locale] as const,
    page: (key: PageKey, locale: Locale) => ['public', 'page', key, locale] as const,
    posts: (params: ListParams) => ['public', 'posts', params] as const,
  },
  admin: {
    me: ['admin', 'me'] as const,
    list: (entity: Entity, params: ListParams) => ['admin', entity, 'list', params] as const,
    detail: (entity: Entity, id: number) => ['admin', entity, 'detail', id] as const,
    all: (entity: Entity) => ['admin', entity] as const,
    inbox: { unread: ['admin', 'inbox', 'unread'] as const },
    stats: (range: '7d' | '30d' | '90d') => ['admin', 'stats', range] as const,
    health: ['admin', 'health'] as const,
    audit: (params: ListParams) => ['admin', 'audit', params] as const,
    pages: {
      list: ['admin', 'pages'] as const,
      detail: (key: PageKey) => ['admin', 'pages', 'detail', key] as const,
    },
    media: {
      all: ['admin', 'media'] as const,
      list: (cursor?: number) => ['admin', 'media', 'list', cursor] as const,
    },
  },
};
