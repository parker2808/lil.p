import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  type AdminUser,
  type AdminUserListPage,
  type AdminUserListParams,
  adminUserListParamsSchema,
  type CreateUserInput,
  createUserSchema,
  type SetPasswordInput,
  setPasswordSchema,
  type UpdateUserInput,
  updateUserSchema,
} from '@portfolio/contracts';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';

@Controller('admin/users')
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminUserListParamsSchema)) query: AdminUserListParams,
  ): Promise<AdminUserListPage> {
    return this.users.list(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput): Promise<AdminUser> {
    return this.users.createAdmin(body);
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserInput,
  ): Promise<AdminUser> {
    return this.users.update(actor.id, id, body);
  }

  @Post(':id/sign-out-everywhere')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOutEverywhere(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.users.bumpTokenVersion(id);
  }

  @Post(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(setPasswordSchema)) body: SetPasswordInput,
  ): Promise<void> {
    await this.users.setPassword(id, body.password);
  }
}
