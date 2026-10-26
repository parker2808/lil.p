import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ChangePasswordInput, LoginInput } from '@portfolio/contracts';
import * as argon2 from 'argon2';

import type { UserRow } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';

export type IssuedTokens = { access: string; refresh: string };

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async login(input: LoginInput): Promise<{ user: UserRow } & IssuedTokens> {
    const user = await this.users.findByEmail(input.email);
    const passwordOk = user ? await verifyPassword(user.passwordHash, input.password) : false;
    if (!user || !user.isActive || !passwordOk) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
    const signedIn = await this.users.touchLastLogin(user.id);
    const access = await this.tokens.signAccess(signedIn);
    const refresh = await this.tokens.signRefresh(signedIn);
    return { user: signedIn, access, refresh };
  }

  async refresh(id: number): Promise<IssuedTokens> {
    const user = await this.users.findById(id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        message: 'Unauthenticated',
      });
    }
    return {
      access: await this.tokens.signAccess(user),
      refresh: await this.tokens.signRefresh(user),
    };
  }

  async changePassword(
    id: number,
    input: ChangePasswordInput,
  ): Promise<{ user: UserRow } & IssuedTokens> {
    const user = await this.users.findById(id);
    const passwordOk = user
      ? await verifyPassword(user.passwordHash, input.currentPassword)
      : false;
    if (!user || !user.isActive || !passwordOk) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
    const passwordHash = await argon2.hash(input.newPassword, { type: argon2.argon2id });
    const updated = await this.users.updatePasswordHash(id, passwordHash);
    return {
      user: updated,
      access: await this.tokens.signAccess(updated),
      refresh: await this.tokens.signRefresh(updated),
    };
  }

  async me(id: number): Promise<UserRow> {
    const user = await this.users.findById(id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        code: 'UNAUTHENTICATED',
        message: 'Unauthenticated',
      });
    }
    return user;
  }
}
