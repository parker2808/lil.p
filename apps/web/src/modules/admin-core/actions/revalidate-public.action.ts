'use server';

import { meSchema } from '@portfolio/contracts';
import { updateTag } from 'next/cache';

import { PUBLIC_CACHE_TAG } from '@/modules/core/constants/cache.constant';
import { apiServer } from '@/modules/core/services/api-server.service';

/** Expires every cached public page and API read so the next visit shows admin edits. Admins only. */
export async function revalidatePublicContent(): Promise<boolean> {
  try {
    const me = await apiServer('/api/auth/me', { withAuth: true, schema: meSchema });
    if (me.role !== 'admin') {
      return false;
    }
  } catch {
    return false;
  }
  updateTag(PUBLIC_CACHE_TAG);
  return true;
}
