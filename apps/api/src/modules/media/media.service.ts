import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdminMedia,
  AdminMediaListPage,
  AdminMediaListParams,
  Locale,
  PublicImage,
  UpdateMediaInput,
} from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { toAdminMedia, toPublicImage } from './media.mapper';
import { detectMediaKind, MEDIA_MAX_BYTES } from './media-kind.util';
import { deliveryUrls, MEDIA_STORAGE, type MediaStorage } from './media-storage';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStorage,
  ) {}

  toImage(row: Parameters<typeof toPublicImage>[0], locale: Locale): PublicImage | null {
    return toPublicImage(row, locale);
  }

  async list(params: AdminMediaListParams): Promise<AdminMediaListPage> {
    const rows = await this.prisma.media.findMany({
      where: params.cursor ? { id: { lt: params.cursor } } : undefined,
      orderBy: [{ id: 'desc' }],
      take: params.limit + 1,
    });
    const page = rows.slice(0, params.limit);
    const extra = rows[params.limit];
    return {
      items: page.map((row) => toAdminMedia(row)),
      nextCursor: extra ? (page[page.length - 1]?.id ?? null) : null,
    };
  }

  async upload(file: { buffer: Buffer; originalname: string; size: number }, userId: number) {
    if (file.size > MEDIA_MAX_BYTES || file.buffer.length > MEDIA_MAX_BYTES) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        fieldErrors: { file: ['Must be 10 MB or smaller'] },
      });
    }
    const kind = detectMediaKind(file.buffer);
    if (!kind) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        fieldErrors: { file: ['Must be a JPG, PNG, WebP, AVIF or PDF'] },
      });
    }
    const stored = await this.storage.upload({
      buffer: file.buffer,
      kind,
      originalName: file.originalname,
    });
    const row = await this.prisma.media.create({
      data: {
        fileName: stored.fileName,
        originalName: file.originalname || stored.fileName,
        mimeType: kind.mime,
        sizeBytes: stored.bytes,
        width: stored.width,
        height: stored.height,
        resourceType: stored.resourceType,
        uploadedById: userId,
      },
    });
    return toAdminMedia(row);
  }

  async update(id: number, input: UpdateMediaInput): Promise<AdminMedia> {
    await this.findRow(id);
    const row = await this.prisma.media.update({
      where: { id },
      data: {
        ...(input.altEn !== undefined ? { altEn: input.altEn } : {}),
        ...(input.altVi !== undefined ? { altVi: input.altVi } : {}),
      },
    });
    return toAdminMedia(row);
  }

  async remove(id: number): Promise<void> {
    const row = await this.findRow(id);
    const used = await this.usageCount(id);
    if (used > 0) {
      throw new ConflictException({ code: 'IN_USE', message: 'This file is still referenced' });
    }
    await this.storage.destroy(row.fileName, row.resourceType === 'raw' ? 'raw' : 'image');
    await this.prisma.media.delete({ where: { id } });
  }

  async publicUrl(fileName: string): Promise<string | null> {
    if (!/^[a-zA-Z0-9]+$/.test(fileName)) {
      return null;
    }
    const row = await this.prisma.media.findUnique({ where: { fileName } });
    if (!row) {
      return null;
    }
    return deliveryUrls(row.fileName, row.resourceType === 'raw' ? 'raw' : 'image').url;
  }

  private async findRow(id: number) {
    const row = await this.prisma.media.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND' });
    }
    return row;
  }

  private async usageCount(id: number): Promise<number> {
    const [site, avatars, resumeEn, resumeVi, covers, postCovers, gallery] = await Promise.all([
      this.prisma.siteSettings.count({ where: { ogImageId: id } }),
      this.prisma.profile.count({ where: { avatarId: id } }),
      this.prisma.profile.count({ where: { resumeEnId: id } }),
      this.prisma.profile.count({ where: { resumeViId: id } }),
      this.prisma.project.count({ where: { coverId: id } }),
      this.prisma.post.count({ where: { coverId: id } }),
      this.prisma.projectImage.count({ where: { mediaId: id } }),
    ]);
    return site + avatars + resumeEn + resumeVi + covers + postCovers + gallery;
  }
}
