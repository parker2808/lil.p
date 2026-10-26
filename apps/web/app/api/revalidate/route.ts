import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const secret = request.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
    : [];

  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({ revalidated: tags });
}
