import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import type {
  AdminTag,
  Locale,
  PublicTag,
  TagCreateInput,
  TagUpdateInput,
} from '@portfolio/contracts';

import { slugify } from '../../common/utils/slug.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { tagSelect } from './entities/tag.entity';
import { toAdminDto, toPublicTag } from './entities/tag.mapper';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async listPublic(locale: Locale): Promise<PublicTag[]> {
    const rows = await this.prisma.tag.findMany({
      select: tagSelect,
      orderBy: { slug: 'asc' },
    });
    return rows.map((row) => toPublicTag(row, locale));
  }

  async listAdmin(): Promise<AdminTag[]> {
    const rows = await this.prisma.tag.findMany({
      select: tagSelect,
      orderBy: { slug: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async getAdmin(id: number): Promise<AdminTag> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: TagCreateInput): Promise<AdminTag> {
    const slug = slugify(input.nameEn);
    if (!slug) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: { nameEn: ['Must contain letters or numbers'] },
      });
    }
    const row = await this.prisma.tag.create({
      data: {
        slug,
        nameEn: input.nameEn,
        nameVi: input.nameVi ?? '',
      },
      select: tagSelect,
    });
    await this.audit?.recordNow({
      action: 'CREATE',
      entityType: 'tag',
      entityId: row.id,
      summary: `Created tag ${row.slug}`,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: TagUpdateInput): Promise<AdminTag> {
    await this.findRow(id);
    const data: Prisma.TagUncheckedUpdateInput = {};
    if (input.nameEn !== undefined) data.nameEn = input.nameEn;
    if (input.nameVi !== undefined) data.nameVi = input.nameVi;
    const row = await this.prisma.tag.update({ where: { id }, data, select: tagSelect });
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'tag',
      entityId: id,
      summary: `Updated tag ${row.slug}`,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminTag> {
    const current = await this.findRow(id);
    await this.prisma.tag.delete({ where: { id } });
    await this.audit?.recordNow({
      action: 'ARCHIVE',
      entityType: 'tag',
      entityId: id,
      summary: `Deleted tag ${current.slug}`,
    });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.tag.findUnique({ where: { id }, select: tagSelect });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Tag ${id} was not found` });
    }
    return row;
  }
}
