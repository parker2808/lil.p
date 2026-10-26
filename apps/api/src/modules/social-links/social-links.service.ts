import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminSocialLink,
  Locale,
  PublicSocialLink,
  SocialLinkCreateInput,
  SocialLinkUpdateInput,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { socialLinkSelect } from './entities/social-link.entity';
import { toAdminDto, toPublicSocialLink } from './entities/social-link.mapper';

const MAX_CTA = 2;

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(locale: Locale): Promise<PublicSocialLink[]> {
    const rows = await this.prisma.socialLink.findMany({
      where: { isVisible: true },
      select: socialLinkSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => toPublicSocialLink(row, locale));
  }

  async listAdmin(): Promise<AdminSocialLink[]> {
    const rows = await this.prisma.socialLink.findMany({
      select: socialLinkSelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminDto);
  }

  async reorder(ids: number[]): Promise<AdminSocialLink[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).socialLink, ids);
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminSocialLink> {
    return toAdminDto(await this.findRow(id));
  }

  async create(input: SocialLinkCreateInput): Promise<AdminSocialLink> {
    if (input.showInCta) {
      await this.assertCtaRoom();
    }
    const row = await this.prisma.socialLink.create({
      data: {
        kind: input.kind,
        labelEn: input.labelEn,
        labelVi: input.labelVi,
        url: input.url,
        showInHeader: input.showInHeader ?? false,
        showInCta: input.showInCta ?? false,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      select: socialLinkSelect,
    });
    return toAdminDto(row);
  }

  async update(id: number, input: SocialLinkUpdateInput): Promise<AdminSocialLink> {
    const current = await this.findRow(id);
    if (input.showInCta && !current.showInCta) {
      await this.assertCtaRoom(id);
    }
    const data: Prisma.SocialLinkUncheckedUpdateInput = {};
    if (input.kind !== undefined) data.kind = input.kind;
    if (input.labelEn !== undefined) data.labelEn = input.labelEn;
    if (input.labelVi !== undefined) data.labelVi = input.labelVi;
    if (input.url !== undefined) data.url = input.url;
    if (input.showInHeader !== undefined) data.showInHeader = input.showInHeader;
    if (input.showInCta !== undefined) data.showInCta = input.showInCta;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    const row = await this.prisma.socialLink.update({
      where: { id },
      data,
      select: socialLinkSelect,
    });
    return toAdminDto(row);
  }

  async remove(id: number): Promise<AdminSocialLink> {
    const current = await this.findRow(id);
    await this.prisma.socialLink.delete({ where: { id } });
    return toAdminDto(current);
  }

  private async assertCtaRoom(exceptId?: number): Promise<void> {
    const count = await this.prisma.socialLink.count({
      where: { showInCta: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
    });
    if (count >= MAX_CTA) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'At most two social links can appear in the CTA',
        fieldErrors: { showInCta: ['At most two links can appear in the CTA'] },
      });
    }
  }

  private async findRow(id: number) {
    const row = await this.prisma.socialLink.findUnique({
      where: { id },
      select: socialLinkSelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Social link ${id} was not found`,
      });
    }
    return row;
  }
}
