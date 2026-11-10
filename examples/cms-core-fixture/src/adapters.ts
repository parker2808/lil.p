import type { AuthorizationPolicy, MediaResolver } from '@parker2808/cms-core/engine';

const localMedia = new Map([[1, '/illustration.svg']]);

export const mediaResolver: MediaResolver<string> = {
  resolve: async (kind, id) => (kind === 'illustration' ? (localMedia.get(id) ?? null) : null),
};

export const capabilities: AuthorizationPolicy<'sample-editor' | 'reader'> = {
  canEdit: (actor) => actor === 'sample-editor',
  canPublish: () => false,
};

export function mediaPath(path: unknown): string | null {
  return [...localMedia.values()].find((value) => value === path) ?? null;
}
