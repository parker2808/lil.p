import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { apiServer } from '@/modules/core/services/api-server.service';
import { safeDraftPath } from '@/modules/core/utils/draft-path.util';

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const path = safeDraftPath(url.searchParams.get('path'));
  const draft = await draftMode();

  if (url.searchParams.get('exit') === '1') {
    draft.disable();
    return NextResponse.redirect(new URL(path, url.origin));
  }

  try {
    await apiServer('/api/auth/me', { withAuth: true });
  } catch {
    const login = new URL('/admin/login', url.origin);
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }

  draft.enable();
  return NextResponse.redirect(new URL(path, url.origin));
}
