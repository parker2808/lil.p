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
  type AdminSkill,
  type AdminSkillCategory,
  type ReorderInput,
  reorderSchema,
  type SkillCategoryCreateInput,
  skillCategoryCreateSchema,
  type SkillCategoryUpdateInput,
  skillCategoryUpdateSchema,
  type SkillCreateInput,
  skillCreateSchema,
  type SkillUpdateInput,
  skillUpdateSchema,
} from '@portfolio/contracts';

import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SkillsService } from './skills.service';

@Controller('admin/skills')
export class AdminSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminSkill[]> {
    return this.skills.listAdmin();
  }

  @Patch('order')
  reorder(@Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput): Promise<AdminSkill[]> {
    return this.skills.reorder(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminSkill> {
    return this.skills.getAdmin(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(skillCreateSchema)) body: SkillCreateInput,
  ): Promise<AdminSkill> {
    return this.skills.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(skillUpdateSchema)) body: SkillUpdateInput,
  ): Promise<AdminSkill> {
    return this.skills.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminSkill> {
    return this.skills.remove(id);
  }
}

@Controller('admin/skill-categories')
export class AdminSkillCategoriesController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  @Roles('admin', 'user')
  list(): Promise<AdminSkillCategory[]> {
    return this.skills.listCategories();
  }

  @Patch('order')
  reorder(
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderInput,
  ): Promise<AdminSkillCategory[]> {
    return this.skills.reorderCategories(body.ids);
  }

  @Get(':id')
  @Roles('admin', 'user')
  get(@Param('id', ParseIntPipe) id: number): Promise<AdminSkillCategory> {
    return this.skills.getCategory(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(skillCategoryCreateSchema)) body: SkillCategoryCreateInput,
  ): Promise<AdminSkillCategory> {
    return this.skills.createCategory(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(skillCategoryUpdateSchema)) body: SkillCategoryUpdateInput,
  ): Promise<AdminSkillCategory> {
    return this.skills.updateCategory(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<AdminSkillCategory> {
    return this.skills.removeCategory(id);
  }
}
