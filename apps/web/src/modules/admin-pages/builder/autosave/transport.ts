import {
  readTree,
  type BuilderDraftSnapshot,
  type DraftSnapshot,
  type TreeDocument,
} from '@parker2808/cms-core/tree';
import type { AdminPage } from '@portfolio/contracts';

import { apiClient } from '@/modules/core/services/api-client.service';

import { builderRegistry } from '../properties/registry';

export type BuilderDraftResponse = {
  mode: 'legacy' | 'tree';
  revision: string;
  tree: TreeDocument | null;
};

function verified(response: BuilderDraftResponse): BuilderDraftSnapshot {
  if (
    response.mode !== 'tree' ||
    !response.tree ||
    !readTree(response.tree, builderRegistry).ok ||
    !/^(0|[1-9]\d*)$/.test(response.revision)
  )
    throw new Error('Invalid builder draft response');
  return { revision: response.revision, tree: response.tree };
}

export function readBuilderDraft(key: string): Promise<BuilderDraftResponse> {
  return apiClient<BuilderDraftResponse>(
    `/api/admin/pages/${encodeURIComponent(key)}/builder/draft`,
  );
}

export function activateBuilderDraft(
  key: string,
  tree: TreeDocument,
  expectedRevision: string,
): Promise<BuilderDraftSnapshot> {
  return apiClient<BuilderDraftResponse>(
    `/api/admin/pages/${encodeURIComponent(key)}/builder/activate`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tree, expectedRevision }),
    },
  ).then(verified);
}

export function saveBuilderDraft(
  key: string,
  tree: TreeDocument,
  expectedRevision: string,
): Promise<BuilderDraftSnapshot> {
  return apiClient<BuilderDraftResponse>(
    `/api/admin/pages/${encodeURIComponent(key)}/builder/draft`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tree, expectedRevision }),
    },
  ).then(verified);
}

export function readActiveBuilderDraft(key: string): Promise<DraftSnapshot> {
  return readBuilderDraft(key).then((response) =>
    response.mode === 'legacy' && response.tree === null && /^(0|[1-9]\d*)$/.test(response.revision)
      ? { revision: response.revision, tree: null }
      : verified(response),
  );
}

export function publishBuilderDraft(
  key: string,
  expectedRevision: string,
  note?: string,
): Promise<AdminPage> {
  return apiClient<AdminPage>(`/api/admin/pages/${encodeURIComponent(key)}/builder/publish`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ expectedRevision, ...(note ? { note } : {}) }),
  });
}

export function restoreBuilderVersion(
  key: string,
  version: number,
  expectedRevision: string,
): Promise<BuilderDraftResponse> {
  return apiClient<BuilderDraftResponse>(
    `/api/admin/pages/${encodeURIComponent(key)}/versions/${version}/builder/restore`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedRevision }),
    },
  );
}
