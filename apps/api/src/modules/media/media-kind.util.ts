export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export type DetectedMedia = {
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | 'application/pdf';
  resourceType: 'image' | 'raw';
};

export function detectMediaKind(buffer: Buffer): DetectedMedia | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', resourceType: 'image' };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', resourceType: 'image' };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', resourceType: 'image' };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
    buffer.subarray(8, 12).toString('ascii').startsWith('avi')
  ) {
    return { mime: 'image/avif', resourceType: 'image' };
  }
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { mime: 'application/pdf', resourceType: 'raw' };
  }
  return null;
}
