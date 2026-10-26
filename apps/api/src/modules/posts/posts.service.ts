import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type {
  AdminPost,
  AdminPostListPage,
  AdminPostListParams,
  Locale,
  PostCreateInput,
  PostListParams,
  PostUpdateInput,
  PublicPostDetail,
  PublicPostListPage,
} from '@portfolio/contracts';
import { parseSort } from '@portfolio/contracts';

import { paginate } from '../../common/utils/paginate.util';
import { readingMinutes } from '../../common/utils/reading-time.util';
import { assertFresh } from '../../common/utils/stale.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  lintErrors,
  markdownAltErrors,
  mediaAltErrors,
  mergeFieldErrors,
  requiredFieldErrors,
} from '../publishing/publish-rules.util';
import { PublishingService } from '../publishing/publishing.service';
import { postTags } from '../publishing/tags.util';
import { type PostRow, postSelect } from './entities/post.entity';
import {
  toAdminDto,
  toAdminListItem,
  toPublicPostDetail,
  toPublicPostListItem,
} from './entities/post.mapper';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly publishing?: PublishingService,
    @Optional() private readonly events?: EventEmitter2,
  ) {}

  async listPublic(locale: Locale, query: PostListParams): Promise<PublicPostListPage> {
    const where: Prisma.PostWhereInput = { status: 'PUBLISHED' };
    if (query.tag) {
      where.tags = { some: { slug: query.tag } };
    }
    if (query.q) {
      where.OR = [{ titleEn: { contains: query.q } }, { titleVi: { contains: query.q } }];
    }

    const { field, direction } = parseSort(query.sort);
    const orderBy: Prisma.PostOrderByWithRelationInput[] = [
      { [field]: direction } as Prisma.PostOrderByWithRelationInput,
      { id: 'asc' },
    ];
    const { skip, take } = paginate(query.page, query.pageSize);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({ where, select: postSelect, orderBy, skip, take }),
    ]);

    return {
      items: rows.map((row) => toPublicPostListItem(row, locale)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async getPublic(slug: string, locale: Locale): Promise<PublicPostDetail> {
    const row = await this.prisma.post.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: postSelect,
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Post ${slug} was not found` });
    }
    return toPublicPostDetail(row, locale);
  }

  async getPreview(slug: string, locale: Locale): Promise<PublicPostDetail> {
    const row = await this.prisma.post.findFirst({
      where: { slug },
      select: postSelect,
    });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Post ${slug} was not found` });
    }
    return toPublicPostDetail(row, locale);
  }

  async listAdmin(query: AdminPostListParams): Promise<AdminPostListPage> {
    const where: Prisma.PostWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.tag) {
      where.tags = { some: { slug: query.tag } };
    }
    if (query.q) {
      where.OR = [
        { titleEn: { contains: query.q } },
        { titleVi: { contains: query.q } },
        { slug: { contains: query.q } },
      ];
    }
    const { field, direction } = parseSort(query.sort);
    const { skip, take } = paginate(query.page, query.pageSize);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        select: postSelect,
        orderBy: [{ [field]: direction } as Prisma.PostOrderByWithRelationInput, { id: 'asc' }],
        skip,
        take,
      }),
    ]);
    return {
      items: rows.map(toAdminListItem),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async getAdmin(id: number): Promise<AdminPost> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: PostCreateInput): Promise<AdminPost> {
    const row = await this.prisma.post.create({
      data: {
        slug: input.slug,
        titleEn: input.titleEn,
        titleVi: input.titleVi,
        excerptEn: input.excerptEn,
        excerptVi: input.excerptVi,
        bodyEn: input.bodyEn,
        bodyVi: input.bodyVi,
        takeawaysEn: input.takeawaysEn,
        takeawaysVi: input.takeawaysVi,
        seoTitleEn: input.seoTitleEn,
        seoTitleVi: input.seoTitleVi,
        seoDescriptionEn: input.seoDescriptionEn,
        seoDescriptionVi: input.seoDescriptionVi,
        isFeatured: input.isFeatured ?? false,
        sortOrder: input.sortOrder ?? 0,
        coverId: input.coverId ?? null,
        status: 'DRAFT',
        readingMinutes: readingMinutes(input.bodyEn),
        tags: input.tagIds ? { connect: input.tagIds.map((id) => ({ id })) } : undefined,
      },
      select: postSelect,
    });
    this.scheduleRevalidate(row.slug);
    return toAdminDto(row);
  }

  async update(id: number, input: PostUpdateInput): Promise<AdminPost> {
    const current = await this.findRow(id);
    assertFresh(current.updatedAt, input.updatedAt);
    const { tagIds, updatedAt, ...fields } = input;
    void updatedAt;
    const bodyEn = fields.bodyEn ?? current.bodyEn;
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id },
        data: {
          ...this.toWriteData(fields),
          readingMinutes: readingMinutes(bodyEn),
        },
      });
      if (tagIds) {
        await tx.post.update({
          where: { id },
          data: { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } },
        });
      }
      return tx.post.findUniqueOrThrow({ where: { id }, select: postSelect });
    });
    this.scheduleRevalidate(current.slug, row.slug);
    return toAdminDto(row);
  }

  async publish(id: number): Promise<AdminPost> {
    const current = await this.findRow(id);
    this.assertPublishable(current);
    const row = await this.prisma.post.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: current.publishedAt ?? new Date(),
      },
      select: postSelect,
    });
    this.events?.emit('content.published', { entity: 'post', id: row.id, slug: row.slug });
    this.scheduleRevalidate(row.slug);
    return toAdminDto(row);
  }

  async unpublish(id: number): Promise<AdminPost> {
    const current = await this.findRow(id);
    const row = await this.prisma.post.update({
      where: { id },
      data: { status: 'DRAFT' },
      select: postSelect,
    });
    this.scheduleRevalidate(current.slug);
    return toAdminDto(row);
  }

  async archive(id: number): Promise<AdminPost> {
    const current = await this.findRow(id);
    const row = await this.prisma.post.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      select: postSelect,
    });
    this.scheduleRevalidate(current.slug);
    return toAdminDto(row);
  }

  private async findRow(id: number) {
    const row = await this.prisma.post.findUnique({ where: { id }, select: postSelect });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Post ${id} was not found` });
    }
    return row;
  }

  private toWriteData(input: Partial<PostCreateInput>): Prisma.PostUncheckedUpdateInput {
    const data: Prisma.PostUncheckedUpdateInput = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.titleEn !== undefined) data.titleEn = input.titleEn;
    if (input.titleVi !== undefined) data.titleVi = input.titleVi;
    if (input.excerptEn !== undefined) data.excerptEn = input.excerptEn;
    if (input.excerptVi !== undefined) data.excerptVi = input.excerptVi;
    if (input.bodyEn !== undefined) data.bodyEn = input.bodyEn;
    if (input.bodyVi !== undefined) data.bodyVi = input.bodyVi;
    if (input.takeawaysEn !== undefined) data.takeawaysEn = input.takeawaysEn;
    if (input.takeawaysVi !== undefined) data.takeawaysVi = input.takeawaysVi;
    if (input.seoTitleEn !== undefined) data.seoTitleEn = input.seoTitleEn;
    if (input.seoTitleVi !== undefined) data.seoTitleVi = input.seoTitleVi;
    if (input.seoDescriptionEn !== undefined) data.seoDescriptionEn = input.seoDescriptionEn;
    if (input.seoDescriptionVi !== undefined) data.seoDescriptionVi = input.seoDescriptionVi;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.coverId !== undefined) data.coverId = input.coverId;
    return data;
  }

  private assertPublishable(row: PostRow): void {
    const fieldErrors = mergeFieldErrors(
      requiredFieldErrors({
        titleEn: row.titleEn,
        slug: row.slug,
        bodyEn: row.bodyEn,
      }),
      lintErrors({
        titleEn: row.titleEn,
        excerptEn: row.excerptEn,
        bodyEn: row.bodyEn,
        takeawaysEn: row.takeawaysEn,
      }),
      mediaAltErrors(row.cover, 'cover'),
      markdownAltErrors(row.bodyEn, 'bodyEn'),
    );
    if (Object.keys(fieldErrors).length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'This post is not ready to publish',
        fieldErrors,
      });
    }
  }

  private scheduleRevalidate(...slugs: string[]): void {
    void this.publishing?.revalidate(slugs.flatMap((slug) => postTags(slug)));
  }
}
