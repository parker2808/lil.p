import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { pageKeySchema, publicPagePathForKey } from '@portfolio/contracts';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const deliverySchema = z.strictObject({
  key: pageKeySchema,
  version: z.number().int().positive(),
  timestamp: z.number().int(),
  deliveryId: z.string().uuid(),
});
const seen = new Map<
  string,
  { digest: string; state: 'in_progress' | 'failed' | 'completed'; timestamp: number }
>();
const latestVersion = new Map<string, number>();
const windowMs = 5 * 60 * 1000;
const replayMs = 10 * 60 * 1000;

async function readDelivery(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 2048) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
}

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.CMS_REVALIDATE_SECRET;
  if (process.env.CMS_PAGE_READ_SOURCE !== 'cms' || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (Number(request.headers.get('content-length')) > 2048) {
    return NextResponse.json({ error: 'Invalid delivery' }, { status: 400 });
  }
  const raw = await readDelivery(request).catch(() => null);
  const signature = request.headers.get('x-cms-signature');
  if (raw === null || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const expected = createHmac('sha256', secret).update(raw).digest();
  const provided = Buffer.from(signature.slice(7), 'hex');
  if (!timingSafeEqual(expected, provided)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid delivery' }, { status: 400 });
  }
  const delivery = deliverySchema.safeParse(body);
  const now = Date.now();
  if (!delivery.success || Math.abs(now - delivery.data.timestamp * 1000) > windowMs) {
    return NextResponse.json({ error: 'Invalid delivery' }, { status: 400 });
  }
  for (const [id, entry] of seen) if (now - entry.timestamp > replayMs) seen.delete(id);
  const digest = createHash('sha256').update(raw).digest('hex');
  const existing = seen.get(delivery.data.deliveryId);
  if (existing && existing.digest !== digest) {
    return NextResponse.json({ error: 'Conflicting delivery' }, { status: 409 });
  }
  if (existing?.state === 'completed') {
    return NextResponse.json({ revalidated: false });
  }
  if (existing?.state === 'in_progress') {
    return NextResponse.json({ error: 'Delivery in progress' }, { status: 503 });
  }
  const previousVersion = latestVersion.get(delivery.data.key) ?? 0;
  if (delivery.data.version < previousVersion) {
    return NextResponse.json({ revalidated: false });
  }
  seen.set(delivery.data.deliveryId, { digest, state: 'in_progress', timestamp: now });
  const path = publicPagePathForKey(delivery.data.key);
  try {
    for (const locale of ['en', 'vi']) {
      revalidateTag(`cms:page:${delivery.data.key}:${locale}`, { expire: 0 });
      revalidatePath(`/${locale}${path === '/' ? '' : path}`);
    }
  } catch {
    seen.set(delivery.data.deliveryId, { digest, state: 'failed', timestamp: now });
    return NextResponse.json({ error: 'Invalidation failed' }, { status: 503 });
  }
  latestVersion.set(delivery.data.key, delivery.data.version);
  seen.set(delivery.data.deliveryId, { digest, state: 'completed', timestamp: now });
  return NextResponse.json({ revalidated: true, version: delivery.data.version });
}
