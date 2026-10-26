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
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProfileStatsService } from './profile-stats.service';

@Controller('admin/profile-stats')
export class AdminProfileStatsController {
  constructor(private readonly stats: ProfileStatsService) {}

  @Get()
  list(): Promise<AdminProfileStat[]> {
    return this.stats.listAdmin();
  }

  @Get(':id')
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
