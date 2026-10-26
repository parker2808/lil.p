import { Injectable } from '@nestjs/common';
import type { Locale, PublicSkill, PublicSkillsGrouped } from '@portfolio/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { skillSelect } from './entities/skill.entity';
import { toPublicSkill } from './entities/skill.mapper';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
