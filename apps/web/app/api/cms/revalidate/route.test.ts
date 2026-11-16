import { createHmac } from 'node:crypto';

import { revalidatePath, revalidateTag } from 'next/cache';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));

import { POST } from './route';

function signed(body: string, signatureBody = body): Request {
  return new Request('http://localhost/api/cms/revalidate', {
    method: 'POST',
    headers: {
      'x-cms-signature': `sha256=${createHmac('sha256', 'unit-test-key').update(signatureBody).digest('hex')}`,
    },
    body,
  });
}

describe('CMS publish webhook', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('does not accept deliveries while the adapter is disabled', async () => {
    vi.stubEnv('CMS_REVALIDATE_SECRET', 'unit-test-key');
    expect((await POST(signed('{}'))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects unsigned, tampered, malformed and expired deliveries before invalidation', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_REVALIDATE_SECRET', 'unit-test-key');
    const payload = {
      key: 'home',
      version: 2,
      timestamp: Math.floor(Date.now() / 1000),
      deliveryId: crypto.randomUUID(),
    };
    const body = JSON.stringify(payload);
    expect((await POST(signed(body, '{}'))).status).toBe(401);
    expect((await POST(signed('not-json'))).status).toBe(400);
    expect((await POST(signed(JSON.stringify({ ...payload, timestamp: 0 })))).status).toBe(400);
    expect((await POST(signed(JSON.stringify({ ...payload, key: 'bad/path' })))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('expires exactly the published page, in both locales, once per delivery', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_REVALIDATE_SECRET', 'unit-test-key');
    const body = JSON.stringify({
      key: 'home',
      version: 3,
      timestamp: Math.floor(Date.now() / 1000),
      deliveryId: crypto.randomUUID(),
    });
    expect((await POST(signed(body))).status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('cms:page:home:en', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('cms:page:home:vi', { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith('/en');
    expect(revalidatePath).toHaveBeenCalledWith('/vi');
    const duplicate = await POST(signed(body));
    expect(await duplicate.json()).toEqual({ revalidated: false });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
  });

  it('ignores an older signed version without invalidating a newer one', async () => {
    vi.stubEnv('CMS_PAGE_READ_SOURCE', 'cms');
    vi.stubEnv('CMS_REVALIDATE_SECRET', 'unit-test-key');
    const timestamp = Math.floor(Date.now() / 1000);
    const delivery = (version: number) =>
      signed(JSON.stringify({ key: 'about', version, timestamp, deliveryId: crypto.randomUUID() }));
    expect((await POST(delivery(5))).status).toBe(200);
    const response = await POST(delivery(4));
    expect(await response.json()).toEqual({ revalidated: false });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
  });
});
