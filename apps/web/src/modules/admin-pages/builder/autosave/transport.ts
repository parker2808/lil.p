import { readTree, type DraftSnapshot, type TreeDocument } from '@parker2808/cms-core/tree';

import { apiClient } from '@/modules/core/services/api-client.service';

export type BuilderDraftResponse = {
  mode: 'legacy' | 'tree';
  revision: string;
  tree: TreeDocument | null;
};

function verified(response: BuilderDraftResponse): DraftSnapshot {
  if (
    response.mode !== 'tree' ||
    !response.tree ||
    !readTree(response.tree).ok ||
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
): Promise<DraftSnapshot> {
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
): Promise<DraftSnapshot> {
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
  return readBuilderDraft(key).then(verified);
}
