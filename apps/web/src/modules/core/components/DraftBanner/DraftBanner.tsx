import { draftMode } from 'next/headers';

import { apiServer } from '../../services/api-server.service';

import { DraftBannerView } from './DraftBannerView';

export async function DraftBanner() {
  const draft = await draftMode();
  if (!draft.isEnabled) {
    return null;
  }

  let signedIn = false;
  try {
    await apiServer('/api/auth/me', { withAuth: true });
    signedIn = true;
  } catch {
    signedIn = false;
  }

  return <DraftBannerView signedIn={signedIn} />;
}
