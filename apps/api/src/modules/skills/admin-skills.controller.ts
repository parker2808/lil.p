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
  type SkillCategoryCreateInput,
  skillCategoryCreateSchema,
  type SkillCategoryUpdateInput,
  skillCategoryUpdateSchema,
  type SkillCreateInput,
  skillCreateSchema,
  type SkillUpdateInput,
  skillUpdateSchema,
} from '@portfolio/contracts';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SkillsService } from './skills.service';

@Controller('admin/skills')
export class AdminSkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Get()
  list(): Promise<AdminSkill[]> {
    return this.skills.listAdmin();
  }

  @Get(':id')
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
  list(): Promise<AdminSkillCategory[]> {
    return this.skills.listCategories();
  }

  @Get(':id')
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
