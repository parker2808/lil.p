import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type {
  AdminSkill,
  AdminSkillCategory,
  Locale,
  PublicSkill,
  PublicSkillsGrouped,
  SkillCategoryCreateInput,
  SkillCategoryUpdateInput,
  SkillCreateInput,
  SkillUpdateInput,
} from '@portfolio/contracts';

import { reorder } from '../../common/utils/reorder.util';
import { slugify } from '../../common/utils/slug.util';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PublishingService } from '../publishing/publishing.service';
import { SKILL_TAGS } from '../publishing/tags.util';
import { skillCategorySelect, skillSelect } from './entities/skill.entity';
import { toAdminCategory, toAdminSkill, toPublicSkill } from './entities/skill.mapper';

@Injectable()
export class SkillsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly publishing?: PublishingService,
  ) {}

  async listPublic(locale: Locale, marquee: boolean): Promise<PublicSkill[] | PublicSkillsGrouped> {
    const rows = await this.prisma.skill.findMany({
      where: {
        isVisible: true,
        ...(marquee ? { showInMarquee: true } : {}),
      },
      select: skillSelect,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    const skills = rows.map((row) => toPublicSkill(row, locale));
    if (marquee) {
      return skills;
    }
    return {
      daily: skills.filter((skill) => skill.depth === 'DAILY'),
      shipped: skills.filter((skill) => skill.depth === 'SHIPPED'),
      growing: skills.filter((skill) => skill.depth === 'GROWING'),
    };
  }

  async listAdmin(): Promise<AdminSkill[]> {
    const rows = await this.prisma.skill.findMany({
      select: skillSelect,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toAdminSkill);
  }

  async reorder(ids: number[]): Promise<AdminSkill[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).skill, ids);
    this.bump();
    return this.listAdmin();
  }

  async getAdmin(id: number): Promise<AdminSkill> {
    return toAdminSkill(await this.findSkill(id));
  }

  async create(input: SkillCreateInput): Promise<AdminSkill> {
    const slug = input.slug ?? slugify(input.name);
    if (!slug) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        fieldErrors: { name: ['Must contain letters or numbers'] },
      });
    }
    const row = await this.prisma.skill.create({
      data: {
        name: input.name,
        slug,
        categoryId: input.categoryId,
        depth: input.depth,
        showInMarquee: input.showInMarquee ?? false,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
      select: skillSelect,
    });
    this.bump();
    return toAdminSkill(row);
  }

  async update(id: number, input: SkillUpdateInput): Promise<AdminSkill> {
    await this.findSkill(id);
    const data: Prisma.SkillUncheckedUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.depth !== undefined) data.depth = input.depth;
    if (input.showInMarquee !== undefined) data.showInMarquee = input.showInMarquee;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.isVisible !== undefined) data.isVisible = input.isVisible;
    const row = await this.prisma.skill.update({ where: { id }, data, select: skillSelect });
    this.bump();
    return toAdminSkill(row);
  }

  async remove(id: number): Promise<AdminSkill> {
    const current = await this.findSkill(id);
    await this.prisma.skill.delete({ where: { id } });
    this.bump();
    return toAdminSkill(current);
  }

  async listCategories(): Promise<AdminSkillCategory[]> {
    const rows = await this.prisma.skillCategory.findMany({
      select: skillCategorySelect,
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toAdminCategory);
  }

  async reorderCategories(ids: number[]): Promise<AdminSkillCategory[]> {
    await reorder(this.prisma, (tx) => (tx as Prisma.TransactionClient).skillCategory, ids);
    this.bump();
    return this.listCategories();
  }

  async getCategory(id: number): Promise<AdminSkillCategory> {
    return toAdminCategory(await this.findCategory(id));
  }

  async createCategory(input: SkillCategoryCreateInput): Promise<AdminSkillCategory> {
    const row = await this.prisma.skillCategory.create({
      data: {
        nameEn: input.nameEn,
        nameVi: input.nameVi,
        sortOrder: input.sortOrder ?? 0,
      },
      select: skillCategorySelect,
    });
    this.bump();
    return toAdminCategory(row);
  }

  async updateCategory(id: number, input: SkillCategoryUpdateInput): Promise<AdminSkillCategory> {
    await this.findCategory(id);
    const data: Prisma.SkillCategoryUncheckedUpdateInput = {};
    if (input.nameEn !== undefined) data.nameEn = input.nameEn;
    if (input.nameVi !== undefined) data.nameVi = input.nameVi;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    const row = await this.prisma.skillCategory.update({
      where: { id },
      data,
      select: skillCategorySelect,
    });
    this.bump();
    return toAdminCategory(row);
  }

  async removeCategory(id: number): Promise<AdminSkillCategory> {
    const current = await this.findCategory(id);
    if (current._count.skills > 0) {
      throw new ConflictException({
        code: 'IN_USE',
        message: 'This category still has skills',
      });
    }
    await this.prisma.skillCategory.delete({ where: { id } });
    this.bump();
    return toAdminCategory(current);
  }

  private bump(): void {
    void this.publishing?.revalidate([...SKILL_TAGS]);
  }

  private async findSkill(id: number) {
    const row = await this.prisma.skill.findUnique({ where: { id }, select: skillSelect });
    if (!row) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: `Skill ${id} was not found` });
    }
    return row;
  }

  private async findCategory(id: number) {
    const row = await this.prisma.skillCategory.findUnique({
      where: { id },
      select: skillCategorySelect,
    });
    if (!row) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Skill category ${id} was not found`,
      });
    }
    return row;
  }
}
