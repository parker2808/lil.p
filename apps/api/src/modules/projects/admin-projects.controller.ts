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
  Query,
} from '@nestjs/common';
import {
  type AdminProject,
  type AdminProjectListItem,
  type AdminProjectListPage,
  type AdminProjectListParams,
  adminProjectListParamsSchema,
  type ProjectCreateInput,
  projectCreateSchema,
  type ProjectUpdateInput,
  projectUpdateSchema,
  type ReorderInput,
  reorderSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProjectsService } from './projects.service';

@Controller('admin/projects')
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @Roles('admin', 'user')
  list(
    @Query(new ZodValidationPipe(adminProjectListParamsSchema)) query: AdminProjectListParams,
  ): Promise<AdminProjectListPage> {
    return this.projects.listAdmin(query);
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminProjectListItem[]> {
    return this.projects.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminProject> {
    return this.projects.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(projectCreateSchema)) body: ProjectCreateInput,
  ): Promise<AdminProject> {
    return this.projects.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(projectUpdateSchema)) body: ProjectUpdateInput,
  ): Promise<AdminProject> {
    return this.projects.update(id, body);
  }

  @Delete(':id')
  archive(@Param('id', ParseIntPipe) id: number): Promise<AdminProject> {
    return this.projects.archive(id);
  }
}
