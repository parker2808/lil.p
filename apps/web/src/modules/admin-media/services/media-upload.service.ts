import { type AdminMedia, adminMediaSchema } from '@portfolio/contracts';

export type UploadProgressHandler = (percent: number) => void;

export function uploadMedia(
  file: File,
  options: { onProgress?: UploadProgressHandler; signal?: AbortSignal } = {},
): Promise<AdminMedia> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media');
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(adminMediaSchema.parse(JSON.parse(xhr.responseText) as unknown));
        } catch (error) {
          reject(error);
        }
        return;
      }
      reject(new Error(xhr.statusText || 'Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.onabort = () =>
      reject(Object.assign(new Error('Upload cancelled'), { name: 'AbortError' }));

    options.signal?.addEventListener('abort', () => xhr.abort(), { once: true });

    const body = new FormData();
    body.append('file', file);
    xhr.send(body);
  });
}
