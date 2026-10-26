import { randomUUID } from 'node:crypto';

import { MEDIA_VARIANT_WIDTHS } from '@portfolio/contracts';
import { v2 as cloudinary } from 'cloudinary';

import type { AppConfigService } from '../../config/app-config.service';
import type { DetectedMedia } from './media-kind.util';

export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');

export type StoredUpload = {
  fileName: string;
  resourceType: 'image' | 'raw';
  bytes: number;
  width: number | null;
  height: number | null;
};

export type DeliveryUrls = {
  url: string;
  srcset: string;
};

export interface MediaStorage {
  upload(input: {
    buffer: Buffer;
    kind: DetectedMedia;
    originalName: string;
  }): Promise<StoredUpload>;
  destroy(fileName: string, resourceType: 'image' | 'raw'): Promise<void>;
  urls(fileName: string, resourceType: 'image' | 'raw'): DeliveryUrls;
}

const FAKE_ORIGIN = 'https://media.test';

export function deliveryUrls(fileName: string, resourceType: 'image' | 'raw'): DeliveryUrls {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    const base = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload`;
    const url = `${base}/portfolio/${fileName}`;
    if (resourceType !== 'image') {
      return { url, srcset: '' };
    }
    return {
      url,
      srcset: MEDIA_VARIANT_WIDTHS.map(
        (width) => `${base}/w_${width},c_limit,f_webp,q_auto/portfolio/${fileName} ${width}w`,
      ).join(', '),
    };
  }
  const url = `${FAKE_ORIGIN}/${fileName}`;
  if (resourceType !== 'image') {
    return { url, srcset: '' };
  }
  return {
    url,
    srcset: MEDIA_VARIANT_WIDTHS.map((width) => `${url}?w=${width}&f=webp ${width}w`).join(', '),
  };
}

export class MemoryMediaStorage implements MediaStorage {
  readonly files = new Map<string, Buffer>();

  async upload(input: {
    buffer: Buffer;
    kind: DetectedMedia;
    originalName: string;
  }): Promise<StoredUpload> {
    const fileName = randomUUID().replaceAll('-', '');
    this.files.set(fileName, input.buffer);
    return {
      fileName,
      resourceType: input.kind.resourceType,
      bytes: input.buffer.length,
      width: input.kind.resourceType === 'image' ? 1 : null,
      height: input.kind.resourceType === 'image' ? 1 : null,
    };
  }

  async destroy(fileName: string): Promise<void> {
    this.files.delete(fileName);
  }

  urls(fileName: string, resourceType: 'image' | 'raw'): DeliveryUrls {
    return deliveryUrls(fileName, resourceType);
  }
}

export class CloudinaryMediaStorage implements MediaStorage {
  constructor(private readonly config: AppConfigService) {
    const cloud = config.cloudinary;
    if (!cloud) {
      throw new Error('Cloudinary is not configured');
    }
    cloudinary.config({
      cloud_name: cloud.cloudName,
      api_key: cloud.apiKey,
      api_secret: cloud.apiSecret,
      secure: true,
    });
  }

  async upload(input: {
    buffer: Buffer;
    kind: DetectedMedia;
    originalName: string;
  }): Promise<StoredUpload> {
    const fileName = randomUUID().replaceAll('-', '');
    const publicId = `portfolio/${fileName}`;
    const uploaded = await new Promise<{
      bytes: number;
      width?: number;
      height?: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: input.kind.resourceType,
          overwrite: false,
          eager:
            input.kind.resourceType === 'image'
              ? MEDIA_VARIANT_WIDTHS.map((width) => ({
                  width,
                  crop: 'limit',
                  fetch_format: 'webp',
                  quality: 'auto',
                  flags: 'force_strip',
                }))
              : undefined,
          transformation:
            input.kind.resourceType === 'image' ? [{ flags: 'force_strip' }] : undefined,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }
          resolve(result);
        },
      );
      stream.end(input.buffer);
    });

    return {
      fileName,
      resourceType: input.kind.resourceType,
      bytes: uploaded.bytes,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
    };
  }

  async destroy(fileName: string, resourceType: 'image' | 'raw'): Promise<void> {
    await cloudinary.uploader.destroy(`portfolio/${fileName}`, { resource_type: resourceType });
  }

  urls(fileName: string, resourceType: 'image' | 'raw'): DeliveryUrls {
    return deliveryUrls(fileName, resourceType);
  }
}

export function createMediaStorage(config: AppConfigService): MediaStorage {
  return config.cloudinary ? new CloudinaryMediaStorage(config) : new MemoryMediaStorage();
}
