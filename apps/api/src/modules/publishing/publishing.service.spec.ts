import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublishingService } from './publishing.service';

describe('PublishingService', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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

  it('does not log page keys, secrets, or upstream errors after both retries fail', async () => {
    const marker = 'draft-tree-token-private-marker';
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error(`first ${marker}`))
      .mockRejectedValueOnce(new Error(`second ${marker}`));
    vi.stubGlobal('fetch', fetchMock);
    const service = new PublishingService({
      webInternalUrl: 'http://localhost:3000/',
      revalidateSecret: marker,
    } as never);

    await expect(service.revalidate([`page:${marker}`])).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith('Revalidate failed after retry');
    expect(JSON.stringify(warn.mock.calls)).not.toContain(marker);
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
