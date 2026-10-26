import { Injectable } from '@nestjs/common';
import type { Role } from '@portfolio/contracts';
import * as argon2 from 'argon2';

import { PrismaService } from '../../prisma/prisma.service';
import { type UserRow, userSelect } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({ where: { email }, select: userSelect });
  }

  findById(id: number): Promise<UserRow | null> {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect });
  }

  async create(input: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }): Promise<UserRow> {
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    return this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: input.role ?? 'user',
      },
      select: userSelect,
    });
  }

  async bumpTokenVersion(id: number): Promise<UserRow> {
    return this.prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
      select: userSelect,
    });
  }

  touchLastLogin(id: number): Promise<UserRow> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: userSelect,
    });
  }
}
