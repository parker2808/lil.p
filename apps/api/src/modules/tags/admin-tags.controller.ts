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
  type AdminTag,
  type TagCreateInput,
  tagCreateSchema,
  type TagUpdateInput,
  tagUpdateSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TagsService } from './tags.service';

@Controller('admin/tags')
export class AdminTagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminTag[]> {
    return this.tags.listAdmin();
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminTag> {
    return this.tags.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(new ZodValidationPipe(tagCreateSchema)) body: TagCreateInput): Promise<AdminTag> {
    return this.tags.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(tagUpdateSchema)) body: TagUpdateInput,
  ): Promise<AdminTag> {
    return this.tags.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminTag> {
    return this.tags.remove(id);
  }
}
