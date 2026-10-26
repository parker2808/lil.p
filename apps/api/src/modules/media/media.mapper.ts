import type { AdminMedia, Locale, PublicImage } from '@portfolio/contracts';

import type { Media } from '../../generated/prisma/client';
import { deliveryUrls } from './media-storage';

export function toAdminMedia(row: Media): AdminMedia {
  const { url, srcset } = deliveryUrls(row.fileName, row.resourceType === 'raw' ? 'raw' : 'image');
  return {
    id: row.id,
    fileName: row.fileName,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    altEn: row.altEn,
    altVi: row.altVi,
    resourceType: row.resourceType,
    uploadedById: row.uploadedById,
    url,
    srcset,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toPublicImage(row: Media | null | undefined, locale: Locale): PublicImage | null {
  if (!row) {
    return null;
  }
  const { url, srcset } = deliveryUrls(row.fileName, row.resourceType === 'raw' ? 'raw' : 'image');
  return {
    url,
    srcset,
    width: row.width,
    height: row.height,
    alt: locale === 'vi' && row.altVi ? row.altVi : row.altEn,
  };
}
