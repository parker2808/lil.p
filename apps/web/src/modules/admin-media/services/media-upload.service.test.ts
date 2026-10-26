import { afterEach, describe, expect, it, vi } from 'vitest';

import { uploadMedia } from './media-upload.service';

class FakeXhr {
  status = 201;
  statusText = 'Created';
  responseText = JSON.stringify({
    id: 1,
    fileName: 'abc',
    originalName: 'cover.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 12,
    width: 1,
    height: 1,
    altEn: '',
    altVi: '',
    resourceType: 'image',
    uploadedById: 1,
    url: 'https://media.test/abc',
    srcset: 'https://media.test/abc?w=480&f=webp 480w',
    createdAt: '2026-01-01T00:00:00.000Z',
  });
  upload = { onprogress: null as ((event: ProgressEvent<EventTarget>) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  withCredentials = false;
  open = vi.fn();
  send = vi.fn(() => {
    this.upload.onprogress?.({ lengthComputable: true, loaded: 40, total: 100 } as ProgressEvent);
    this.onload?.();
  });
  abort = vi.fn();
}

describe('uploadMedia', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts FormData and reports progress', async () => {
    const xhr = new FakeXhr();
    vi.stubGlobal('XMLHttpRequest', vi.fn(() => xhr) as unknown as typeof XMLHttpRequest);
    const onProgress = vi.fn();
    const media = await uploadMedia(new File(['x'], 'cover.jpg'), { onProgress });
    expect(xhr.open).toHaveBeenCalledWith('POST', '/api/admin/media');
    expect(onProgress).toHaveBeenCalledWith(40);
    expect(media.fileName).toBe('abc');
  });
});
