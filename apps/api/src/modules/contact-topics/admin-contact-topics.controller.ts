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
  type AdminContactTopic,
  type ContactTopicCreateInput,
  contactTopicCreateSchema,
  type ContactTopicUpdateInput,
  contactTopicUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ContactTopicsService } from './contact-topics.service';

@Controller('admin/contact-topics')
export class AdminContactTopicsController {
  constructor(private readonly topics: ContactTopicsService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminContactTopic[]> {
    return this.topics.listAdmin();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminContactTopic[]> {
    return this.topics.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminContactTopic> {
    return this.topics.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(contactTopicCreateSchema)) body: ContactTopicCreateInput,
  ): Promise<AdminContactTopic> {
    return this.topics.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(contactTopicUpdateSchema)) body: ContactTopicUpdateInput,
  ): Promise<AdminContactTopic> {
    return this.topics.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminContactTopic> {
    return this.topics.remove(id);
  }
}
