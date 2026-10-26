import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  type AdminProfileStat,
  type ProfileStatCreateInput,
  profileStatCreateSchema,
  type ProfileStatUpdateInput,
  profileStatUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProfileStatsService } from './profile-stats.service';

@Controller('admin/profile-stats')
export class AdminProfileStatsController {
  constructor(private readonly stats: ProfileStatsService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminProfileStat[]> {
    return this.stats.listAdmin();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminProfileStat[]> {
    return this.stats.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminProfileStat> {
    return this.stats.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(profileStatCreateSchema)) body: ProfileStatCreateInput,
  ): Promise<AdminProfileStat> {
    return this.stats.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(profileStatUpdateSchema)) body: ProfileStatUpdateInput,
  ): Promise<AdminProfileStat> {
    return this.stats.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminProfileStat> {
    return this.stats.remove(id);
  }
}
