import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import type {
  AdminContactTopic,
  ContactTopicCreateInput,
  ContactTopicUpdateInput,
  Locale,
  PublicContactTopic,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { contactTopicSelect } from './entities/contact-topic.entity';
import { toAdminDto, toPublicContactTopic } from './entities/contact-topic.mapper';

@Injectable()
export class ContactTopicsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async listPublic(locale: Locale): Promise<PublicContactTopic[]> {
    const rows = await this.prisma.contactTopic.findMany({
      where: { isVisible: true },
      select: contactTopicSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicContactTopic(row, locale));
  }

  async listAdmin(): Promise<AdminContactTopic[]> {
    const rows = await this.prisma.contactTopic.findMany({
      select: contactTopicSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminContactTopic[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).contactTopic, ids);
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'contact-topic',
      entityId: ids[0] ?? 0,
      summary: `Reordered ${ids.length} contact topics`,
    });
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminContactTopic> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: ContactTopicCreateInput): Promise<AdminContactTopic> {
    const row = await this.prisma.contactTopic.create({
      data: {
        slug: input.slug,
        labelEn: input.labelEn,
        labelVi: input.labelVi,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      select: contactTopicSelect,
    });
    await this.audit?.recordNow({
      action: 'CREATE',
      entityType: 'contact-topic',
      entityId: row.id,
      summary: `Created contact topic ${row.slug}`,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: ContactTopicUpdateInput): Promise<AdminContactTopic> {
    await this.findRow(id);
    const data: Prisma.ContactTopicUncheckedUpdateInput = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.labelEn !== undefined) data.labelEn = input.labelEn;
    if (input.labelVi !== undefined) data.labelVi = input.labelVi;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    const row = await this.prisma.contactTopic.update({
      where: { id },
      data,
      select: contactTopicSelect,
    });
    await this.audit?.recordNow({
      action: 'UPDATE',
      entityType: 'contact-topic',
      entityId: id,
      summary: `Updated contact topic ${row.slug}`,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminContactTopic> {
    const current = await this.findRow(id);
    await this.prisma.contactTopic.delete({ where: { id } });
    await this.audit?.recordNow({
      action: 'ARCHIVE',
      entityType: 'contact-topic',
      entityId: id,
      summary: `Deleted contact topic ${current.slug}`,
    });
    return toAdminDto(current);
  }

  private async findRow(id: number) {
    const row = await this.prisma.contactTopic.findUnique({
      where: { id },
      select: contactTopicSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contact topic ${id} was not found`,
      });
    }
    return row;
  }
}
