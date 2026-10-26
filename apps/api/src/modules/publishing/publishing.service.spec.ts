import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublishingService } from './publishing.service';

describe('PublishingService', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts tags once when the web answers 200', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const service = new PublishingService({
      webInternalUrl: 'http://localhost:3000',
      revalidateSecret: 'secret',
    } as never);
    await service.revalidate(['posts', 'post:a']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/revalidate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-revalidate-secret': 'secret' }),
      }),
    );
  });

  it('retries once and never throws', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('down'));
    vi.stubGlobal('fetch', fetchMock);
    const service = new PublishingService({
      webInternalUrl: 'http://localhost:3000/',
      revalidateSecret: 'secret',
    } as never);
    await expect(service.revalidate(['site'])).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('skips when the secret or URL is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const service = new PublishingService({
      webInternalUrl: null,
      revalidateSecret: null,
    } as never);
    await service.revalidate(['site']);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
